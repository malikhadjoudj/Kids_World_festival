import { useEffect, useMemo, useRef, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { MOCK_STANDS, ZONES } from '../../data/mockStands';
import { PACKS } from '../../constants/packs';
import { fetchExposants, fetchStands, updateStand, createStand, deleteStand } from '../../services/api';
import './FloorPlanPage.css';

const PACK_COLORS = {
  'discover-fun': '#FF6B35',
  'sell-win': '#06D6A0',
  'pack-italie': '#5B8C5A',
  'pack-turquie': '#FFD166',
  'pack-algerie': '#E63946',
  'espace-nu': '#1B4965',
};

const enrichStandForDisplay = (stand, index = 0) => {
  if (stand.zone) return stand;

  // Derive zone from ID prefix to match ZONES in mockStands.js
  let zone = 'option';
  if (stand.id?.startsWith('SP')) zone = 'sponsor';
  else if (stand.id?.startsWith('C')) zone = 'chapiteau';
  else if (stand.id?.startsWith('NU')) zone = 'option';

  return {
    ...stand,
    zone,
    angle: stand.angle ?? index * 30,
  };
};

const sortStands = (list) =>
  [...list].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' })
  );

function FloorPlanPage() {
  const [stands, setStands] = useState(MOCK_STANDS);
  const [exposants, setExposants] = useState([]);
  const [selectedStand, setSelectedStand] = useState(null);
  const [draggingStand, setDraggingStand] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [newStandType, setNewStandType] = useState('chapiteau'); // 'chapiteau', 'sponsor', 'option'
  const svgRef = useRef(null);
  const movedDuringDragRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const pendingSavesRef = useRef({});
  const CX = 350;
  const CY = 320;
  const ringRadii = { outer: 260, middle: 190, inner: 110 };

  const standToExposant = useMemo(() => {
    const map = {};
    exposants.forEach((e) => {
      if (e.standId) map[e.standId] = e;
    });
    return map;
  }, [exposants]);

  const occupiedCount = Object.keys(standToExposant).length;

  const getStandPosition = (stand) => {
    if (stand.x !== undefined && stand.x !== null && stand.y !== undefined && stand.y !== null) {
      return { x: stand.x, y: stand.y };
    }

    const radius = ringRadii[stand.ring] || ringRadii.outer;
    const angleRad = ((stand.angle || 0) - 90) * (Math.PI / 180);
    return {
      x: CX + radius * Math.cos(angleRad),
      y: CY + radius * Math.sin(angleRad),
    };
  };

  const getStandSize = (stand) => {
    // Use custom width/height if set, otherwise calculate from surface
    if (stand.customWidth && stand.customHeight) {
      return { width: stand.customWidth, height: stand.customHeight };
    }
    const surface = Number(stand.surface) || 10;
    const w = 20 + Math.sqrt(surface) * 5;
    const h = 20 + Math.sqrt(surface) * 1.4;
    return {
      width: Math.max(24, Math.min(150, w)),
      height: Math.max(20, Math.min(50, h)),
    };
  };

  const toSvgPoint = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!(svg instanceof SVGSVGElement)) return { x: clientX, y: clientY };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: clientX, y: clientY };
    return pt.matrixTransform(matrix.inverse());
  };

  const saveStandUpdate = async (standId, data) => {
    const pending = pendingSavesRef.current;
    pending[standId] = data;

    if (pending[`${standId}__inFlight`]) return;
    pending[`${standId}__inFlight`] = true;

    try {
      while (pending[standId]) {
        const toSend = pending[standId];
        delete pending[standId];
        await updateStand(standId, toSend);
      }
    } finally {
      delete pending[`${standId}__inFlight`];
    }
  };

  const handlePointerDown = (event, standId) => {
    if (addMode) return; // Don't drag in add mode
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const stand = stands.find((s) => s.id === standId);
    if (!stand) return;

    const point = toSvgPoint(event.clientX, event.clientY);
    const pos = getStandPosition(stand);
    movedDuringDragRef.current = false;
    setDraggingStand(standId);
    setDragOffset({ x: point.x - pos.x, y: point.y - pos.y });
    
  };

  const handlePointerMove = (event) => {
    if (!draggingStand) return;
    const point = toSvgPoint(event.clientX, event.clientY);
    const nextX = point.x - dragOffset.x;
    const nextY = point.y - dragOffset.y;
    movedDuringDragRef.current = true;

    setStands((prev) =>
      prev.map((stand) =>
        stand.id === draggingStand
          ? { ...stand, x: nextX, y: nextY }
          : stand
      )
    );
  };

  const handlePointerUp = async () => {
    if (!draggingStand) return;
    const stand = stands.find((s) => s.id === draggingStand);
    if (movedDuringDragRef.current) suppressNextClickRef.current = true;
    if (!stand) {
      setDraggingStand(null);
      return;
    }

    setDraggingStand(null);
    const size = getStandSize(stand);
    const encodedX = Math.floor(stand.x) + size.width / 1000;
    const encodedY = Math.floor(stand.y) + size.height / 1000;

    try {
      setIsSaving(true);
      await saveStandUpdate(stand.id, {
        x: encodedX,
        y: encodedY,
        surface: stand.surface,
      });
      setMessage('Position et taille du stand mises à jour.');
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Erreur lors de la sauvegarde du stand.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSurfaceChange = (event) => {
    const value = Number(event.target.value);
    if (!selectedStand) return;
    setStands((prev) =>
      prev.map((stand) =>
        stand.id === selectedStand
          ? { ...stand, surface: Number.isFinite(value) ? Math.max(1, value) : stand.surface }
          : stand
      )
    );
  };

  const handleWidthChange = (event) => {
    const value = Number(event.target.value);
    if (!selectedStand) return;
    setStands((prev) =>
      prev.map((stand) =>
        stand.id === selectedStand
          ? { ...stand, customWidth: Number.isFinite(value) ? Math.max(10, value) : stand.customWidth }
          : stand
      )
    );
  };

  const handleHeightChange = (event) => {
    const value = Number(event.target.value);
    if (!selectedStand) return;
    setStands((prev) =>
      prev.map((stand) =>
        stand.id === selectedStand
          ? { ...stand, customHeight: Number.isFinite(value) ? Math.max(10, value) : stand.customHeight }
          : stand
      )
    );
  };

  const handleSelectedStandSave = async () => {
    const stand = stands.find((s) => s.id === selectedStand);
    if (!stand) return;

    const size = getStandSize(stand);
    const encodedX = Math.floor(stand.x) + size.width / 1000;
    const encodedY = Math.floor(stand.y) + size.height / 1000;

    try {
      setIsSaving(true);
      await saveStandUpdate(stand.id, {
        x: encodedX,
        y: encodedY,
        surface: stand.surface,
      });
      setMessage('Stand enregistré avec succès.');
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Erreur lors de la sauvegarde du stand.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate next stand ID based on type
  const getNextStandId = (type) => {
    const prefix = type === 'sponsor' ? 'SP' : type === 'option' ? 'NU' : 'C';
    const existing = stands
      .filter((s) => s.id.startsWith(prefix))
      .map((s) => {
        const num = parseInt(s.id.replace(prefix, ''), 10);
        return isNaN(num) ? 0 : num;
      });
    const max = existing.length > 0 ? Math.max(...existing) : 0;
    const next = max + 1;
    return next < 10 ? `${prefix}0${next}` : `${prefix}${next}`;
  };

  // Add stand by clicking on the map
  const handleMapClick = async (event) => {
    if (!addMode) return;
    
    const point = toSvgPoint(event.clientX, event.clientY);
    const newId = getNextStandId(newStandType);
    const surface = newStandType === 'sponsor' ? 50 : newStandType === 'option' ? 30 : 12;

    const width = newStandType === 'sponsor' ? 60 : newStandType === 'option' ? 50 : 35;
    const height = newStandType === 'sponsor' ? 40 : newStandType === 'option' ? 45 : 30;

    const encodedX = Math.round(point.x) + width / 1000;
    const encodedY = Math.round(point.y) + height / 1000;

    const newStand = {
      id: newId,
      zone: newStandType,
      surface,
      x: encodedX,
      y: encodedY,
      packCompatible: 'all',
    };

    try {
      setIsSaving(true);
      setMessage('');
      const created = await createStand(newStand);

      // Decode coordinates of the newly created stand
      const xVal = created.x || 0;
      const yVal = created.y || 0;
      const xInt = Math.floor(xVal);
      const yInt = Math.floor(yVal);
      const widthDec = Math.round((xVal - xInt) * 1000);
      const heightDec = Math.round((yVal - yInt) * 1000);
      
      const decodedCreated = {
        ...created,
        x: xInt,
        y: yInt,
        customWidth: widthDec > 0 ? widthDec : null,
        customHeight: heightDec > 0 ? heightDec : null,
      };

      setStands((prev) => sortStands([...prev, enrichStandForDisplay(decodedCreated)]));
      setMessage(`Stand ${newId} créé avec succès !`);
      setSelectedStand(newId);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Erreur lors de la création du stand.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete selected stand
  const handleDeleteStand = async () => {
    if (!selectedStand) return;
    const exposant = standToExposant[selectedStand];
    
    if (exposant) {
      const confirmed = window.confirm(
        `Ce stand est attribué à "${exposant.raisonSociale}". Supprimer le stand va le désassigner. Continuer ?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(`Supprimer le stand ${selectedStand} ? Cette action est irréversible.`);
      if (!confirmed) return;
    }

    try {
      setIsSaving(true);
      await deleteStand(selectedStand);
      setStands((prev) => prev.filter((s) => s.id !== selectedStand));
      setMessage(`Stand ${selectedStand} supprimé.`);
      setSelectedStand(null);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Erreur lors de la suppression du stand.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedStandData = stands.find((stand) => stand.id === selectedStand);
  const selectedExposant = selectedStandData ? standToExposant[selectedStandData.id] : null;
  const selectedPack = selectedExposant ? PACKS.find((pack) => pack.id === selectedExposant.packId) : null;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const [standsData, exposantsData] = await Promise.all([fetchStands(), fetchExposants()]);
        if (standsData.length === 0) {
          setStands([]);
        } else {
          // Decode custom dimensions from coordinate decimal values
          const decoded = standsData.map((s) => {
            const xVal = s.x || 0;
            const yVal = s.y || 0;
            const xInt = Math.floor(xVal);
            const yInt = Math.floor(yVal);
            const widthDec = Math.round((xVal - xInt) * 1000);
            const heightDec = Math.round((yVal - yInt) * 1000);
            
            return {
              ...s,
              x: xInt,
              y: yInt,
              customWidth: widthDec > 0 ? widthDec : null,
              customHeight: heightDec > 0 ? heightDec : null,
            };
          });
          setStands(sortStands(decoded.map(enrichStandForDisplay)));
        }
        setExposants(exposantsData);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Impossible de charger les données du plan.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-main__header">
          <h1>🗺️ Plan de salle interactif</h1>
          <p>Positionnez, ajoutez ou supprimez des stands directement sur le plan.</p>
        </div>

        <div className="floor-plan__toolbar">
          <div className="floor-plan__legend">
            <span className="floor-plan__legend-title">Légende :</span>
            {PACKS.map((pack) => (
              <span key={pack.id} className="floor-plan__legend-item">
                <span
                  className="floor-plan__legend-dot"
                  style={{ background: PACK_COLORS[pack.id] }}
                ></span>
                {pack.name.replace('Formule ', '')}
              </span>
            ))}
            <span className="floor-plan__legend-item">
              <span
                className="floor-plan__legend-dot"
                style={{ background: '#e0e0e0' }}
              ></span>
              Libre
            </span>
          </div>

          <div className="floor-plan__stats-mini">
            <span>📍 {occupiedCount}/{stands.length} occupés</span>
            <span>⬜ {stands.length - occupiedCount} libres</span>
          </div>
        </div>

        {/* Add Stand Toolbar */}
        <div className="floor-plan__add-toolbar">
          <button
            className={`floor-plan__add-btn ${addMode ? 'floor-plan__add-btn--active' : ''}`}
            onClick={() => setAddMode(!addMode)}
          >
            {addMode ? '✕ Annuler ajout' : '➕ Ajouter un stand'}
          </button>
          {addMode && (
            <div className="floor-plan__add-options">
              <span className="floor-plan__add-label">Type :</span>
              <select
                value={newStandType}
                onChange={(e) => setNewStandType(e.target.value)}
                className="floor-plan__add-select"
              >
                <option value="chapiteau">🎪 Chapiteau</option>
                <option value="sponsor">🏢 Sponsor</option>
                <option value="option">📐 Espace Nu</option>
              </select>
              <span className="floor-plan__add-hint">
                👆 Cliquez sur le plan pour placer le stand
              </span>
            </div>
          )}
        </div>

        {error && <div className="floor-plan__error">{error}</div>}
        {loading && <div className="floor-plan__loading">Chargement du plan...</div>}

        <div
          className="floor-plan__layout"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div className={`floor-plan__map-container ${addMode ? 'floor-plan__map-container--add-mode' : ''}`}>
            <svg
              ref={svgRef}
              viewBox="0 0 700 640"
              className="floor-plan__svg"
              onClick={handleMapClick}
            >
              {/* Background image of the Les Sablettes venue map — clean version */}
              <image href="/assets/clean-floor-plan.jpg" x="0" y="0" width="700" height="640" preserveAspectRatio="none" />

              {stands.map((stand) => {
  const pos = getStandPosition(stand);
  const { width, height } = getStandSize(stand);
  const exposant = standToExposant[stand.id];
  const color = exposant ? PACK_COLORS[exposant.packId] || '#ccc' : 'transparent';
  const isOccupied = Boolean(exposant);
  const isSelected = selectedStand === stand.id;
  const rotation = stand.angle || 0;

  return (
    <g
      key={stand.id}
      className={`floor-plan__stand ${isOccupied ? 'floor-plan__stand--occupied' : 'floor-plan__stand--free'} ${isSelected ? 'floor-plan__stand--selected' : ''}`}
      onPointerDown={(e) => handlePointerDown(e, stand.id)}
      onClick={(e) => {
        e.stopPropagation();
        if (addMode) return;
        if (suppressNextClickRef.current) {
          suppressNextClickRef.current = false;
          return;
        }
        setSelectedStand(isSelected ? null : stand.id);
      }}
      style={{ cursor: addMode ? 'crosshair' : 'pointer' }}
      transform={`translate(${pos.x}, ${pos.y}) rotate(${rotation})`}
    >
      {/* Invisible hitbox — always present so hover/click works */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={4}
        fill={isOccupied ? color : 'transparent'}
        fillOpacity={isOccupied ? 0.55 : 0}
        stroke={isSelected ? '#06D6A0' : 'transparent'}
        strokeWidth={isSelected ? 2.5 : 0}
        className="floor-plan__stand-hitbox"
      />
      {/* Label — only visible when occupied or selected */}
      {(isOccupied || isSelected) && (
        <text
          x={0}
          y={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isOccupied ? '#fff' : '#06D6A0'}
          fontSize="8"
          fontWeight="700"
          fontFamily="var(--font-display)"
          transform={`rotate(${-rotation})`}
          pointerEvents="none"
        >
          {stand.id}
        </text>
      )}
    </g>
  );
              })}
            </svg>
          </div>

          <div className="floor-plan__panel">
            {selectedStandData ? (
              <div className="floor-plan__detail">
                <h3>Stand {selectedStandData.id}</h3>
                <div className="floor-plan__detail-zone">
                  {ZONES.find((zone) => zone.id === selectedStandData.zone)?.name || 'Zone inconnue'}
                </div>
                <div className="floor-plan__detail-row">
                  <label>Surface (m²)</label>
                  <input
                    type="number"
                    min="5"
                    value={selectedStandData.surface}
                    onChange={handleSurfaceChange}
                  />
                </div>
                <div className="floor-plan__detail-row-duo">
                  <div className="floor-plan__detail-row">
                    <label>Largeur</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={Math.round(getStandSize(selectedStandData).width)}
                      onChange={handleWidthChange}
                    />
                  </div>
                  <div className="floor-plan__detail-row">
                    <label>Hauteur</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={Math.round(getStandSize(selectedStandData).height)}
                      onChange={handleHeightChange}
                    />
                  </div>
                </div>
                <div className="floor-plan__detail-row-duo">
                  <div className="floor-plan__detail-row">
                    <label>Position X</label>
                    <input
                      type="number"
                      value={Math.round(selectedStandData.x ?? getStandPosition(selectedStandData).x)}
                      readOnly
                    />
                  </div>
                  <div className="floor-plan__detail-row">
                    <label>Position Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedStandData.y ?? getStandPosition(selectedStandData).y)}
                      readOnly
                    />
                  </div>
                </div>
                {selectedExposant ? (
                  <div className="floor-plan__detail-occupant">
                    {selectedPack && (
                      <div
                        className="floor-plan__detail-badge"
                        style={{ background: PACK_COLORS[selectedPack.id] }}
                      >
                        {selectedPack.icon} {selectedPack.name}
                      </div>
                    )}
                    <span className="floor-plan__detail-label">Attribué à :</span>
                    <strong>{selectedExposant.raisonSociale}</strong>
                    <span>{selectedExposant.nomPrenom}</span>
                    <span>{selectedExposant.activite}</span>
                  </div>
                ) : (
                  <div className="floor-plan__detail-free">
                    <span>Libre</span>
                    <p>Sélectionnez ce stand dans le tableau de bord pour l'assigner.</p>
                  </div>
                )}
                <button
                  className="floor-plan__detail-save"
                  onClick={handleSelectedStandSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Enregistrement...' : '💾 Enregistrer modifications'}
                </button>
                <button
                  className="floor-plan__detail-delete"
                  onClick={handleDeleteStand}
                  disabled={isSaving}
                >
                  🗑️ Supprimer ce stand
                </button>
                {message && <div className="floor-plan__detail-message">{message}</div>}
              </div>
            ) : (
              <div className="floor-plan__detail-empty">
                <span>👆</span>
                <p>Cliquez sur un stand pour modifier sa taille ou sa position.</p>
                <p>Glissez le carré pour le déplacer sur le plan.</p>
              </div>
            )}

            <div className="floor-plan__zone-summary">
              <h3>Zones</h3>
              {ZONES.map((zone) => {
                const zoneStands = stands.filter((s) => s.zone === zone.id);
                const occupied = zoneStands.filter((s) => Boolean(standToExposant[s.id])).length;
                return (
                  <div key={zone.id} className="floor-plan__zone-row">
                    <span className="floor-plan__zone-dot" style={{ background: zone.color }}></span>
                    <span className="floor-plan__zone-name">{zone.name}</span>
                    <span className="floor-plan__zone-count">{occupied}/{zoneStands.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FloorPlanPage;

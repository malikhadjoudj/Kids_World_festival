import { useEffect, useMemo, useRef, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { MOCK_STANDS, ZONES } from '../../data/mockStands';
import { PACKS } from '../../constants/packs';
import { fetchExposants, fetchStands, updateStand } from '../../services/api';
import './FloorPlanPage.css';

const PACK_COLORS = {
  standard: '#FF6B35',
  'expo-plus': '#FFD166',
  'espace-vente': '#06D6A0',
  'espace-nu': '#1B4965',
};

const enrichStandForDisplay = (stand, index) => {
  if (stand.zone && stand.ring && stand.angle !== undefined) return stand;

  const prefix = stand.id?.charAt(0)?.toUpperCase();
  const zone = prefix === 'B' ? 'inter' : prefix === 'C' ? 'centre' : 'ext';
  const ring = prefix === 'B' ? 'middle' : prefix === 'C' ? 'inner' : 'outer';
  const zoneIndex = Number.parseInt(String(stand.id).replace(/\D/g, ''), 10) - 1;
  const fallbackIndex = Number.isFinite(zoneIndex) ? zoneIndex : index;
  const ringCounts = { outer: 12, middle: 10, inner: 6 };

  return {
    ...stand,
    zone,
    ring,
    angle: stand.angle ?? fallbackIndex * (360 / ringCounts[ring]),
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
  const svgRef = useRef(null);
  const movedDuringDragRef = useRef(false);
  const suppressNextClickRef = useRef(false);

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
    if (stand.x !== undefined && stand.y !== undefined) {
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
    const surface = Number(stand.surface) || 10;
    const side = 20 + Math.sqrt(surface) * 3.5;
    return Math.max(24, Math.min(90, side));
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

  const handlePointerDown = (event, standId) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const stand = stands.find((s) => s.id === standId);
    if (!stand) return;

    const point = toSvgPoint(event.clientX, event.clientY);
    const pos = getStandPosition(stand);
    movedDuringDragRef.current = false;
    setDraggingStand(standId);
    setDragOffset({ x: point.x - pos.x, y: point.y - pos.y });
    setSelectedStand(standId);
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
    try {
      setIsSaving(true);
      await updateStand(stand.id, {
        x: stand.x,
        y: stand.y,
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

  const handleSelectedStandSave = async () => {
    const stand = stands.find((s) => s.id === selectedStand);
    if (!stand) return;

    try {
      setIsSaving(true);
      await updateStand(stand.id, {
        x: stand.x,
        y: stand.y,
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
          setError('Aucun stand trouve en base. Lancez le seed Prisma pour initialiser le plan.');
          setStands([]);
        } else {
          setStands(sortStands(standsData.map(enrichStandForDisplay)));
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
          <p>Modifiez la taille et la position des stands directement sur le plan.</p>
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

        {error && <div className="floor-plan__error">{error}</div>}
        {loading && <div className="floor-plan__loading">Chargement du plan...</div>}

        <div
          className="floor-plan__layout"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div className="floor-plan__map-container">
            <svg
              ref={svgRef}
              viewBox="0 0 700 640"
              className="floor-plan__svg"
            >
              <circle cx={CX} cy={CY} r={290} fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={CX} cy={CY} r={220} fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={CX} cy={CY} r={140} fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="4 4" />

              <circle cx={CX} cy={CY} r={60} fill="#f0f7f0" stroke="#c8e6c9" strokeWidth="2" />
              <text x={CX} y={CY - 8} textAnchor="middle" fill="#4CAF50" fontSize="10" fontWeight="600">
                SCÈNE
              </text>
              <text x={CX} y={CY + 8} textAnchor="middle" fill="#4CAF50" fontSize="8">
                CENTRALE
              </text>

              <text x={CX} y={45} textAnchor="middle" fill="#999" fontSize="10" fontWeight="500">
                ZONE EXTÉRIEURE — 5300 m²
              </text>
              <text x={CX} y={CY - 155} textAnchor="middle" fill="#999" fontSize="9">
                ZONE INTERMÉDIAIRE — 3800 m²
              </text>
              <text x={CX} y={CY - 75} textAnchor="middle" fill="#999" fontSize="8">
                ZONE CENTRALE — 1200 m²
              </text>

              <line x1={50} y1={CY + 250} x2={130} y2={CY + 170} stroke="#FF6B35" strokeWidth="3" />
              <text x={40} y={CY + 270} fill="#FF6B35" fontSize="10" fontWeight="600" transform={`rotate(-45, 40, ${CY + 270})`}>
                ACCÈS
              </text>

              {stands.map((stand) => {
                const pos = getStandPosition(stand);
                const size = getStandSize(stand);
                const exposant = standToExposant[stand.id];
                const color = exposant ? PACK_COLORS[exposant.packId] || '#ccc' : '#e0e0e0';
                const isOccupied = Boolean(exposant);
                const isSelected = selectedStand === stand.id;

                return (
                  <g
                    key={stand.id}
                    className={`floor-plan__stand ${isOccupied ? 'floor-plan__stand--occupied' : 'floor-plan__stand--free'} ${isSelected ? 'floor-plan__stand--selected' : ''}`}
                    onPointerDown={(e) => handlePointerDown(e, stand.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (suppressNextClickRef.current) {
                        suppressNextClickRef.current = false;
                        return;
                      }
                      setSelectedStand(isSelected ? null : stand.id);
                    }}
                    style={{ cursor: 'grab' }}
                  >
                    <rect
                      x={pos.x - size / 2}
                      y={pos.y - size / 2}
                      width={size}
                      height={size}
                      rx={6}
                      fill={color}
                      stroke={isSelected ? '#0B2545' : 'rgba(0,0,0,0.1)'}
                      strokeWidth={isSelected ? 3 : 1}
                      opacity={isOccupied ? 1 : 0.55}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isOccupied ? '#fff' : '#666'}
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="var(--font-display)"
                    >
                      {stand.id}
                    </text>
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
                    <p>Sélectionnez ce stand dans le tableau de bord pour l’assigner.</p>
                  </div>
                )}
                <button
                  className="floor-plan__detail-save"
                  onClick={handleSelectedStandSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer modifications'}
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

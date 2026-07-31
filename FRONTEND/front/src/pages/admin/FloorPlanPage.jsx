import { useState, useMemo } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { MOCK_EXPOSANTS } from '../../data/mockExposants';
import { MOCK_STANDS, ZONES } from '../../data/mockStands';
import { PACKS } from '../../constants/packs';
import './FloorPlanPage.css';

const PACK_COLORS = {
  standard: '#FF6B35',
  'expo-plus': '#FFD166',
  'espace-vente': '#06D6A0',
  'espace-nu': '#1B4965',
};

function FloorPlanPage() {
  const [exposants] = useState(MOCK_EXPOSANTS);
  const [selectedStand, setSelectedStand] = useState(null);

  // Build reverse map: standId -> exposant
  const standToExposant = useMemo(() => {
    const map = {};
    exposants.forEach((e) => {
      if (e.standId) map[e.standId] = e;
    });
    return map;
  }, [exposants]);

  const occupiedCount = Object.keys(standToExposant).length;

  // SVG dimensions
  const cx = 350;
  const cy = 320;
  const ringRadii = { outer: 260, middle: 190, inner: 110 };
  const standSize = { outer: 36, middle: 30, inner: 34 };

  const getStandPosition = (stand) => {
    const radius = ringRadii[stand.ring];
    const angleRad = (stand.angle - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad),
    };
  };

  const getStandColor = (stand) => {
    const exposant = standToExposant[stand.id];
    if (exposant) {
      return PACK_COLORS[exposant.packId] || '#ccc';
    }
    return '#e0e0e0';
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-main__header">
          <h1>🗺️ Plan de salle interactif</h1>
          <p>Disposition circulaire — 3 zones concentriques — El Harrach, Alger</p>
        </div>

        {/* Legend & Stats */}
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
            <span>📍 {occupiedCount}/{MOCK_STANDS.length} occupés</span>
            <span>⬜ {MOCK_STANDS.length - occupiedCount} libres</span>
          </div>
        </div>

        <div className="floor-plan__layout">
          {/* SVG Map */}
          <div className="floor-plan__map-container">
            <svg
              viewBox="0 0 700 640"
              className="floor-plan__svg"
            >
              {/* Zone circles (background) */}
              <circle cx={cx} cy={cy} r={290} fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={cx} cy={cy} r={220} fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={cx} cy={cy} r={140} fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Central area */}
              <circle cx={cx} cy={cy} r={60} fill="#f0f7f0" stroke="#c8e6c9" strokeWidth="2" />
              <text x={cx} y={cy - 8} textAnchor="middle" fill="#4CAF50" fontSize="10" fontWeight="600">
                SCÈNE
              </text>
              <text x={cx} y={cy + 8} textAnchor="middle" fill="#4CAF50" fontSize="8">
                CENTRALE
              </text>

              {/* Zone labels */}
              <text x={cx} y={45} textAnchor="middle" fill="#999" fontSize="10" fontWeight="500">
                ZONE EXTÉRIEURE — 5300 m²
              </text>
              <text x={cx} y={cy - 155} textAnchor="middle" fill="#999" fontSize="9">
                ZONE INTERMÉDIAIRE — 3800 m²
              </text>
              <text x={cx} y={cy - 75} textAnchor="middle" fill="#999" fontSize="8">
                ZONE CENTRALE — 1200 m²
              </text>

              {/* Entry */}
              <line x1={50} y1={cy + 250} x2={130} y2={cy + 170} stroke="#FF6B35" strokeWidth="3" />
              <text x={40} y={cy + 270} fill="#FF6B35" fontSize="10" fontWeight="600" transform={`rotate(-45, 40, ${cy + 270})`}>
                ACCÈS
              </text>

              {/* Stands */}
              {MOCK_STANDS.map((stand) => {
                const pos = getStandPosition(stand);
                const size = standSize[stand.ring];
                const color = getStandColor(stand);
                const isOccupied = !!standToExposant[stand.id];
                const isSelected = selectedStand === stand.id;

                return (
                  <g
                    key={stand.id}
                    className={`floor-plan__stand ${isOccupied ? 'floor-plan__stand--occupied' : 'floor-plan__stand--free'} ${isSelected ? 'floor-plan__stand--selected' : ''}`}
                    onClick={() => setSelectedStand(isSelected ? null : stand.id)}
                    style={{ cursor: 'pointer' }}
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
                      opacity={isOccupied ? 1 : 0.5}
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

          {/* Side panel */}
          <div className="floor-plan__panel">
            {selectedStand ? (
              (() => {
                const stand = MOCK_STANDS.find((s) => s.id === selectedStand);
                const exposant = standToExposant[selectedStand];
                const pack = exposant ? PACKS.find((p) => p.id === exposant.packId) : null;
                const zone = ZONES.find((z) => z.id === stand.zone);

                return (
                  <div className="floor-plan__detail">
                    <h3>Stand {stand.id}</h3>
                    <div className="floor-plan__detail-zone" style={{ color: zone.color }}>
                      {zone.name}
                    </div>
                    <p className="floor-plan__detail-surface">{stand.surface} m²</p>

                    {exposant ? (
                      <div className="floor-plan__detail-occupant">
                        <div className="floor-plan__detail-badge" style={{ background: PACK_COLORS[exposant.packId] }}>
                          {pack?.icon} {pack?.name}
                        </div>
                        <h4>{exposant.raisonSociale}</h4>
                        <p>{exposant.nomPrenom}</p>
                        <p>{exposant.tel}</p>
                        <p className="floor-plan__detail-activite">{exposant.activite}</p>
                      </div>
                    ) : (
                      <div className="floor-plan__detail-free">
                        <span>⬜</span>
                        <p>Ce stand est libre</p>
                        <p className="floor-plan__detail-hint">
                          Attribuez-le depuis le tableau de bord
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="floor-plan__detail-empty">
                <span>👆</span>
                <p>Cliquez sur un stand pour voir ses détails</p>
              </div>
            )}

            {/* Zone summary */}
            <div className="floor-plan__zone-summary">
              <h3>Zones</h3>
              {ZONES.map((zone) => {
                const zoneStands = MOCK_STANDS.filter((s) => s.zone === zone.id);
                const occupied = zoneStands.filter((s) => standToExposant[s.id]).length;
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

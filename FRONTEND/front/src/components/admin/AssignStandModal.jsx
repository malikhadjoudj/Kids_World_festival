import { useState } from 'react';
import { MOCK_STANDS, ZONES } from '../../data/mockStands';
import './AssignStandModal.css';

function AssignStandModal({ exposant, stands, assignments, onAssign, onClose }) {
  const [selectedStand, setSelectedStand] = useState('');

  if (!exposant) return null;

  // Filter available stands (not assigned to anyone)
  const assignedStandIds = Object.values(assignments);
  const availableStands = stands.filter((s) => !assignedStandIds.includes(s.id));

  const handleSubmit = () => {
    if (selectedStand) {
      onAssign(exposant.id, selectedStand);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="assign-modal__header">
          <h2>📍 Attribuer un emplacement</h2>
          <p>Sélectionnez un stand libre pour <strong>{exposant.raisonSociale}</strong></p>
        </div>

        <div className="assign-modal__body">
          <div className="assign-modal__zones">
            {ZONES.map((zone) => {
              const zoneStands = availableStands.filter((s) => s.zone === zone.id);
              if (zoneStands.length === 0) return null;
              return (
                <div key={zone.id} className="assign-modal__zone">
                  <h3 style={{ color: zone.color }}>
                    {zone.name}
                    <span className="assign-modal__zone-count">
                      {zoneStands.length} disponible{zoneStands.length > 1 ? 's' : ''}
                    </span>
                  </h3>
                  <div className="assign-modal__stands-grid">
                    {zoneStands.map((stand) => (
                      <button
                        key={stand.id}
                        className={`assign-modal__stand-btn ${selectedStand === stand.id ? 'assign-modal__stand-btn--selected' : ''}`}
                        onClick={() => setSelectedStand(stand.id)}
                      >
                        <span className="assign-modal__stand-id">{stand.id}</span>
                        <span className="assign-modal__stand-surface">{stand.surface} m²</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {availableStands.length === 0 && (
            <p className="assign-modal__empty">Tous les stands sont occupés.</p>
          )}
        </div>

        <div className="assign-modal__footer">
          <button className="assign-modal__cancel" onClick={onClose}>Annuler</button>
          <button
            className="assign-modal__confirm"
            onClick={handleSubmit}
            disabled={!selectedStand}
          >
            Attribuer le stand {selectedStand || '...'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignStandModal;

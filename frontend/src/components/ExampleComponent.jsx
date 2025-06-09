import { useToast } from '../hooks/useToast';

const ExampleComponent = () => {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Opération réussie ! 🎉', 'success');
  };

  const handleError = () => {
    showToast('Une erreur est survenue ❌', 'error');
  };

  const handleWarning = () => {
    showToast('Attention, cette action est irréversible ⚠️', 'warning');
  };

  const handleInfo = () => {
    showToast('Voici une information importante ℹ️', 'info');
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Exemple de Notifications
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleSuccess}
          className="lexia-btn lexia-btn-success"
          aria-label="Afficher une notification de succès"
        >
          Succès
        </button>

        <button
          onClick={handleError}
          className="lexia-btn lexia-btn-error"
          aria-label="Afficher une notification d'erreur"
        >
          Erreur
        </button>

        <button
          onClick={handleWarning}
          className="lexia-btn lexia-btn-warning"
          aria-label="Afficher une notification d'avertissement"
        >
          Avertissement
        </button>

        <button
          onClick={handleInfo}
          className="lexia-btn lexia-btn-info"
          aria-label="Afficher une notification d'information"
        >
          Information
        </button>
      </div>
    </div>
  );
};

export default ExampleComponent; 
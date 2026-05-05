export default function ErrorMessage({ error }) {
  if (!error) return null;

  return (
    <div className="error-message" role="alert">
      {error.message || error}
    </div>
  );
}

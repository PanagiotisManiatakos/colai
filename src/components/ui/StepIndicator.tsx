export function StepIndicator({
  steps,
  current,
  setStep
}: {
  steps: string[];
  current: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="app-card p-3 mb-3">
      <div className="d-flex align-items-center justify-content-between">
        {steps.map((label, idx) => {
          const active = idx === current;
          const done = idx < current;

          return (
            <div key={label} className="d-flex flex-column align-items-center flex-fill" onClick={() => setStep(idx)}>
              <div
                className={
                  "d-flex align-items-center justify-content-center rounded-pill" +
                  (active
                    ? " bg-primary text-white"
                    // : done
                    //   ? " bg-success text-white"
                    //   : " bg-secondary-subtle text-secondary")
                    : " bg-secondary-subtle text-secondary")
                }
                style={{ width: 32, height: 32, fontWeight: 700 }}
              >
                {/* {done ? <i className="bi bi-check" /> : idx + 1} */}
                {idx + 1}
              </div>
              <div className={"small mt-1" + (active ? " fw-semibold" : " text-secondary")}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

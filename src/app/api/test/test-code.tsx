export const TestCode = (
  <div data-name="anthony" className="title-circles-container">
    "hello world"
    {["a", "b", "c"]}
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="title-circle-element">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="circulin"></div>
        ))}
      </div>
    ))}
  </div>
);

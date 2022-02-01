import React, { useState } from "react";
import clsx from "clsx";
import * as styles from "./Widgets.module.scss";

const SelectField = ({ name, options, onChange, isInvalid, contest }) => {
  const [value, setValue] = useState("");
  const [qaMessage, setQaMessage] = useState(false);

  const handleChange = (e) => {
    setValue(e.target.value);
    onChange(e);
    const { name, value } = e.target;

    if (
      (name === "risk" && value.slice(0, 1) <= 1) ||
      value.slice(0, 1) === "G"
    ) {
      setQaMessage(true);
    } else {
      setQaMessage(false);
    }
  };

  return (
    <>
      {qaMessage && (
        <div>
          <p className="warning-message">
            👋 Hi there! We've changed the way we are handling low risk,
            non-critical, and gas optimization findings. Please submit them all
            as one report. Check out <a href="">the FAQ</a> for more details.
          </p>
        </div>
      )}
      <select
        className={clsx(
          styles.Control,
          styles.Select,
          isInvalid && "input-error",
          value === "" && styles.Placeholder
        )}
        name={name}
        onChange={handleChange}
      >
        <option value="">Select...</option>
        {options.map((option, index) => (
          <option key={"option-" + index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default SelectField;

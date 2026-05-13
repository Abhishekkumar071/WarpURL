import { useState } from "react";

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  className = "",
  autoComplete,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const inputType = type === "password" ? (showPass ? "text" : "password") : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="label-xs">{label}</label>}

      <div className={`input-wrap ${error ? "err" : ""}`}>
        {Icon && (
          <span className="text-slate-400 flex items-center shrink-0">
            <Icon size={16} />
          </span>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          className="input-field"
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors text-xs px-1"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-red-500 text-[11px] font-medium">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/**
 * Input — reusable, self-validating form field (renders <input> or <textarea>).
 *
 * Each Input manages its own value/validity/touched state internally via useReducer,
 * then reports the latest (value, isValid) up to the parent form through the onInput
 * callback. This keeps validation logic colocated with the field while letting a
 * parent useForm hook aggregate the overall form state.
 */
import { useReducer, useEffect } from "react";

import { validate } from "../../util/validators";
import "./Input.css";

// Local state machine for a single field. We use useReducer (not useState) because
// value/isValid/isTouched change together in coordinated ways across two actions.
const inputReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      // Re-run all validators on every keystroke so validity stays in sync with value.
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case "TOUCH": {
      // Marked touched on blur — used to delay showing errors until the user has
      // actually interacted with the field (see render below).
      return {
        ...state,
        isTouched: true,
      };
    }
    default:
      return state;
  }
};

const Input = (props) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || "",
    isTouched: false,
    isValid: props.initialValid || false,
  });

  const { id, onInput } = props;
  const { value, isValid } = inputState;

  // Push this field's latest value/validity up to the parent form whenever they
  // change. Destructured deps (not props.value etc.) keep the dependency array stable.
  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const changeHandler = (event) => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators: props.validators,
    });
  };

  const touchHandler = () => {
    dispatch({
      type: "TOUCH",
    });
  };

  // Choose the underlying control based on the `element` prop ("input" vs "textarea").
  // Both wire onChange -> validate and onBlur -> mark touched.
  const element =
    props.element === "input" ? (
      <input
        id={props.id}
        type={props.type}
        placeholder={props.placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
        maxLength={props.maxLength}
      />
    ) : (
      <textarea
        id={props.id}
        rows={props.rows || 3}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    );

  return (
    <div
      className={`form-control ${
        !inputState.isValid && inputState.isTouched && "form-control--invalid"
      }`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      {element}
      {/* Only surface the error after the field is touched, so users aren't
          warned about an empty field before they've had a chance to type. */}
      {!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
    </div>
  );
};

export default Input;

/**
 * form-hook.js — reusable form state manager
 *
 * useForm centralizes the state of an ENTIRE form (every input's value and
 * validity plus the form's overall isValid flag) in a single useReducer.
 * Components get a state object plus two stable callbacks: inputHandler for
 * per-field changes and setFormData to bulk-load data (e.g. into edit forms).
 */
import { useCallback, useReducer } from "react";

const formReducer = (state, action) => {
  switch (action.type) {
    case "INPUT_CHANGE":
      // Recompute whether the WHOLE form is valid by AND-ing every field's
      // validity together — the form is valid only if all inputs are valid.
      let formIsValid = true;
      for (const inputId in state.inputs) {
        // Skip inputs that aren't currently registered/present.
        if (!state.inputs[inputId]) {
          continue;
        }
        // Use the incoming value for the field that just changed, and the
        // existing stored validity for all the other fields.
        if (inputId === action.inputId) {
          formIsValid = formIsValid && action.isValid;
        } else {
          formIsValid = formIsValid && state.inputs[inputId].isValid;
        }
      }
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.inputId]: { value: action.value, isValid: action.isValid },
        },
        isValid: formIsValid,
      };
    // SET_DATA replaces the whole form state at once — used to reset the form
    // or to preload it with existing data (e.g. populating an edit form once
    // the place to edit has been fetched).
    case "SET_DATA":
      return {
        inputs: action.inputs,
        isValid: action.formIsValid,
      };
    default:
      return state;
  }
};

export const useForm = (initialInputs, initialFormValidity) => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    isValid: initialFormValidity,
  });

  // useCallback keeps these handlers referentially stable so child inputs that
  // depend on them in their own effects don't re-fire on every render.
  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({
      type: "INPUT_CHANGE",
      value: value,
      isValid: isValid,
      inputId: id,
    });
  }, []);

  const setFormData = useCallback((inputData, formValidity) => {
    dispatch({
      type: "SET_DATA",
      inputs: inputData,
      formIsValid: formValidity,
    });
  }, []);

  return [formState, inputHandler, setFormData];
};

/**
 * ImageUpload — file picker with live image preview for forms.
 *
 * The actual <input type="file"> is hidden and triggered by a styled Button, so the
 * UI matches the rest of the app. When a file is picked it generates an in-browser
 * preview via FileReader and reports the raw File object up to the parent form
 * through onInput (the same contract used by the Input component).
 */
import { useRef, useState, useEffect } from "react";

import Button from "./Button";
import "./ImageUpload.css";

const ImageUpload = (props) => {
  const [file, setFile] = useState();        // the picked File object
  const [previewUrl, setPreviewUrl] = useState(); // data URL used for the <img> preview
  const [isValid, setIsValid] = useState(false);

  // Ref to the hidden file input so the visible Button can programmatically click it.
  const filePickerRef = useRef();

  // Whenever a new file is chosen, read it into a base64 data URL for the preview.
  // Runs only when `file` changes (the early return guards the initial empty state).
  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = (event) => {
    let pickedFile;
    // Track validity in a local variable because setIsValid is async and wouldn't
    // be updated in time for the onInput call below.
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    // Hand the actual File object up to the parent form for later upload.
    props.onInput(props.id, pickedFile, fileIsValid);
  };

  // Forward the visible Button's click to the hidden native file input.
  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  return (
    <div className="form-control">
      {/* Hidden native input; restricted to image types and driven via the ref. */}
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: "none" }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="Preview" />}
          {!previewUrl && <p>Please pick an image.</p>}
        </div>
        <Button type="button" onClick={pickImageHandler}>
          PICK IMAGE
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;

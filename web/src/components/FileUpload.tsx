import { Upload } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  label: string;
  help?: string;
  onFile: (file: File) => void;
}

export function FileUpload({ accept, label, help, onFile }: FileUploadProps) {
  return (
    <label className="file-upload">
      <Upload size={20} aria-hidden="true" />
      <span>{label}</span>
      {help ? <small>{help}</small> : null}
      <input
        accept={accept}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) onFile(file);
          event.currentTarget.value = "";
        }}
        type="file"
      />
    </label>
  );
}


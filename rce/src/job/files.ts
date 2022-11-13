type File = {
    fileName: string;
    code: string;
    entrypoint: boolean;
}

export class Files {
  public readonly files: File[];
  constructor(files: Array<{ fileName: string, code: string, entrypoint: boolean }>, extension: string) {
    this.files = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.fileName === "") {
        this.files.push({ fileName: `code${i}.${extension}`, code: file.code, entrypoint: true });
      } else {
        this.files.push(file);
      }
    }
  }
}

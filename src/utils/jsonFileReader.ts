import {json} from "express";
import {readFileSync, writeFileSync} from "fs";
class jsonFileReader {
  readFileJson(filePath: string) {
    const jsonData = readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData);
  }
  writeFileJson(filePath: string, data: any): void {
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }
}

export default new jsonFileReader();

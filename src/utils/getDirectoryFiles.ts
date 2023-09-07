import fs from 'fs';
import tmp from 'tmp';
import AdmZip from 'adm-zip';
import * as PATH from 'path';

export function zipDirectory(path: string): fs.ReadStream {
    const tmpZipFile = tmp.fileSync({postfix: '.zip'});
    const zip = new AdmZip();
    zip.addLocalFolder(path);
    
    fs.writeSync(tmpZipFile.fd, zip.toBuffer());
    return fs.createReadStream(tmpZipFile.name);
}

export function getDirectoryFiles(parent: string, path: string): { name: string, path: string, stream: fs.ReadStream}[] {
    const result: { name: string, path: string, stream: fs.ReadStream}[] = [];
    const pathLs = fs.readdirSync(PATH.join(parent, path), { withFileTypes: true });

    const solFiles = pathLs.filter((subpath) => !subpath.isDirectory() && subpath.name.endsWith('.sol'));
    const directories = pathLs.filter((subpath) => subpath.isDirectory());

    for (const file of solFiles) {
        result.push({ name: file.name, path: parent.length > 0 ? path : '', stream: fs.createReadStream(PATH.join(parent, path, file.name)) });
    }

    for (const dir of directories) {
        const subdirectoryFiles = getDirectoryFiles(PATH.join(parent, path), dir.name);
        result.push(
            ...(parent.length > 0)
                ? subdirectoryFiles.map(({ name, path: filePath, stream }) => ({ name, path: PATH.join(path, filePath), stream }))
                : subdirectoryFiles);
    }

    return result;
}

import { readdirSync, lstatSync } from 'fs';
import { pathToFileURL } from 'url';

/** Gets all folders in a given path
 * @param {String | URL} path */
export function GetFolders(path) {
  const folders = readdirSync(path)
    .map((dirContent) => {
      const URL = pathToFileURL(path);
      URL.pathname += `/${dirContent}`;
      return URL;
    })
    .filter((folder) => lstatSync(folder).isDirectory());
  return folders;
}

/** Imports all files from folders, does not search from subdirectories
 * @param {URL[]} folders Paths to folders must be absolute */
export function GetImportsFromFolders(folders, fileType = 'js') {
  // eslint-disable-next-line no-param-reassign
  if (!Array.isArray(folders)) folders = [folders];
  const promises = folders.flatMap((folder) => {
    const files = readdirSync(folder).filter((file) =>
      file.endsWith(`.${fileType}`)
    );
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    return files.map((file) => import(`${folder}/${file}`));
  });

  return promises;
}

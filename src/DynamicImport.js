import { readdirSync, lstatSync } from 'fs';

/** Gets all folders in a given path using <URL> file: protocol
 * @param {String} path Path should start with `./ or /`:
 * - Use `.` to have it converted into the current working directory
 * - Use `/` in case of hostnames (untested)
 */
export function GetFolders(path) {
  // Checks if string starts properly and that ther aren't any //...
  if (!/^.?[/](?!.+[/]{2,})/.test(path)) throw Error('Path is incorrect');
  // eslint-disable-next-line no-param-reassign
  if (path[path.length - 1] !== '/') path += '/';

  const FullPath = (folder) =>
    new URL(`file:///${path.replace('.', process.cwd()) + folder}`);
  const HostPath = (folder) => new URL(`file://${path}${folder}`);

  const addPath = path[0] === '.' ? FullPath : HostPath;
  const folders = readdirSync(path).filter((folder) =>
    lstatSync(addPath(folder)).isDirectory()
  );
  return folders.map(addPath);
}

/** Imports all files from folders, does not search from subdirectories
 * @param {String[]} folders Paths to folders must be absolute
 */
export function GetImportsFromFolders(folders, fileType = 'js') {
  const promises = folders
    .map((folder) => {
      const files = readdirSync(folder).filter((file) =>
        file.endsWith(`.${fileType}`)
      );
      return files.map((file) => import(`${folder}/${file}`));
    })
    .flat();
  return promises;
}

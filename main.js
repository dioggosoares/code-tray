const { resolve, basename } = require('path');
const {
  app,
  Menu,
  MenuItem,
  Tray,
  dialog
} = require('electron');
const spawn = require('cross-spawn');
const Store = require('electron-store');

const schema = {
  projects: {
    type: 'string',
  },
};

const store = new Store({ schema });

let tray = null;

function render(){

  const storedProjects = store.get('projects');
  const projects = storedProjects ? JSON.parse(storedProjects) : [];

  const items = projects.map(project => ({
    label: project.name,
    submenu: [
      {
        label: 'Abrir no VSCode',
        click: () => {
          spawn.sync('code', [project.dirPath], { stdio: 'inherit' });
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Abrir no Atom',
        click: () => {
          spawn.sync('atom', [project.dirPath], { stdio: 'inherit' });
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Remover',
        click: () => {
          store.set('projects', JSON.stringify(projects.filter(item => item.dirPath !== project.dirPath)));

          render();
        },
      },
    ]
  }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Adicionar novo projeto...',
      click: async () => {

        const path = await dialog.showOpenDialog({ properties: ['openDirectory'] });
        const dirPath = path.filePaths.join(' ');
        const name = basename(dirPath);

        store.set('projects', JSON.stringify([...projects, {
            dirPath,
            name,
        }]));

        render();
      },
    },
    {
      type: 'separator',
    },
    ...items,
    {
      type: 'separator',
    },
    {
      type: 'normal',
      label: 'Fechar',
      role: 'quit',
      enabled: true,
    },
  ]);

  tray.setContextMenu(contextMenu);
}

app.on('ready', () => {
  tray = new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'));

  render();
});

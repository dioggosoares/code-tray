const { resolve, basename } = require('path');
const { app, Menu, Tray, dialog, MenuItem } = require('electron');
const spawn = require('cross-spawn');
const Store = require('electron-store');

const schema = {
    projects: {
        type: 'string',
    },
};

const store = new Store({ schema });
// store.clear();

let tray = null;

function render(){

    if(!tray.isDestroyed()){
        tray.destroy();
        tray = new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'));
    }

    const storedProjects = store.get('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];

    const items = projects.map(project => ({
        label: project.name,
        click: () => {
            spawn.sync('code', [project.dirPath], { stdio: 'inherit' });
        },
    }));
    
    const contextMenu = Menu.buildFromTemplate([
        ...items,
        {
            type: 'separator',
        },
        ]);
    
    contextMenu.insert(0, new MenuItem({
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
    }));

    tray.setContextMenu(contextMenu);
}

app.on('ready', () => {
    tray = new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'));

    render();
});
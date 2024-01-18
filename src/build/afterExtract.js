// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = function( extractPath, electronVersion, platform, arch, done )
{
    console.log({ extractPath });
    fs.copy('./python/dist/manage', path.join( extractPath, 'python/dist/manage' ), () => {

        console.log('Finished Copy Python Folder');
    } );
    fs.copy('icon.png', path.join( extractPath, 'icon.png' ), () => {

        console.log('Finished Copy icon');
        done();
    } );
 }
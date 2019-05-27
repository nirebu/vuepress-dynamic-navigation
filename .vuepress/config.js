const glob = require('glob');
const _ = require('lodash');

// Get a list of the top level directories
const topLevelDirs = glob.sync( 'docs/*' );

/*
  Generate the nav items in the vuepress format of
  nav: [
    { text: 'Human readable text' , link: 'path/to/tld' },
    { ... }
  ]
*/

const navbarItems = topLevelDirs.map( tld => {
  return {
    link: `/${tld}/`,
    text: _( tld.substring( tld.lastIndexOf('/')+1 ) ).startCase()
  }
});

/*
  We'll need to get the list of subdirectories
  and their contents from each tld.
  Each sidebar will be an array of objects with this structure:
  [
    {
      title: 'Pretty name of subdir',
      path: 'Dunno what it does',
      collapsable: true, // because twirly things are cool
      children: [
        [ 'relative/path/to/markdownfileWithout.md' , 'Pretty name' ],
        [...]
      ]
    },
    {
      ...
    }
  ]
*/
function buildSidebarFromTld( tld ) {
  var tldSidebar = []; // Initialise empty array to contain the sidebar structure
  const tldSubdirs = glob.sync( '*/' , { cwd: `${tld}` } );
  tldSubdirs.forEach( subdir => {
    console.log(tld);
    console.log(subdir);
    const subdirChildren = glob.sync( `${subdir}/*.md` , { cwd: `${tld}` } )
    //.filter( filename => ! filename.includes('README') )
    .map( filename => {
      if( filename.includes('README') ) {
        return `${subdir}`;
      }
      else {
        return filename.replace('.md','');
      }
    });
    const subdirContent = {
      title: _(subdir).startCase(),
      path: `/${tld}/${subdir}`,
      collapsable: false,
      children: subdirChildren
    };
    tldSidebar.push(subdirContent);
  });
  return tldSidebar;
}

var themeSidebar = {};
topLevelDirs.map( tld => {
  themeSidebar[`/${tld}/`] = buildSidebarFromTld(tld);
});


console.log( JSON.stringify(themeSidebar,null,2) );

module.exports = {
  title: 'Cerberoos Docs',
  themeConfig: {
    nav: navbarItems,
    sidebar: themeSidebar,
  }
};

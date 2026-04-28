import { createMuiTheme } from '@material-ui/core/styles';
 
const theme = createMuiTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
      xxl: 2560,
    },
  },
  typography: {
    h3: {
      justifyContent:'center',
      textAlign:'left',
      fontSize: '1.2rem',color:'#292929',
      '@media (min-width:0px) and (max-width:599.95px)': {//xs
        textAlign:'left',
        fontSize: '1.7vh',
        color:'#292929'
      },
      '@media (min-width:600px) and (max-width:959.95px)': {//sm
        textAlign:'left',
        fontSize: '2vh',
        color:'#292929'
      },
      '@media (min-width:960px) and (max-width:1279.95px)': {//md
        textAlign:'left',
        fontSize: '1.7vh',
        color:'#292929'
      },
      '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
        textAlign:'left',
        fontSize: '2vh',
        color:'#292929'
      },
      '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
        textAlign:'left',
        fontSize: '2vh',
        color:''
      },
    },
    selector: {
      fontSize: '2rem',
      '@media (min-width:0px) and (max-width:599.95px)': {//xs
        fontSize: '1rem',
      },
      '@media (min-width:600px) and (max-width:959.95px)': {//sm
        fontSize: '1.5rem',
      },
      '@media (min-width:960px) and (max-width:1279.95px)': {//md
        fontSize: '1.8rem', color:'green'
      },
      '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
        fontSize: '2rem',
      },
      '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
        fontSize: '2rem',color:'orange'
      },
    },
  },
  statusFont: {
    '@media (min-width:0px) and (max-width:599.95px)': {//xs
      textAlign:'left',
      fontSize: '1.2vh',
      color:'#292929'
    },
    '@media (min-width:600px) and (max-width:959.95px)': {//sm
      textAlign:'left',
      fontSize: '2vh',
      color:'#292929'
    },
    '@media (min-width:960px) and (max-width:1279.95px)': {//md
      textAlign:'left',
      fontSize: '1.2vh',
      color:'#292929'
    },
    '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
      textAlign:'left',
      fontSize: '2vh',
      color:'#292929'
    },
    '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
      textAlign:'left',
      fontSize: '2vh',
      color:''
    },
  }
});
 
export default theme; // Export only the h1 typography styles
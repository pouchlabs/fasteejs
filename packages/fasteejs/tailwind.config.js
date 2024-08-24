/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{html,js,svelte,ts,css}','./node_modules/@pouchlab/ui/dist/**/*.{html,js,svelte,ts,css}'],
  theme: {
    extend: {
     
    }
  },
  daisyui: {
      themes:[{
          default:{
          "primary": "#FF3E00",
                                
          "secondary": "#0DC6D1",
                    
          "accent": "#00D7C0",
                    
          "neutral": "#2B3440",
                    
          "base-100": "#ffffff",
                    
          "info": "#00B5FF",
                    
          "success": "#00A96E",
                    
          "warning": "#FFBF01",
                    
          "error": "#FF5861",
          },
            dark: {
              ...require("daisyui/src/theming/themes")["dark"],
              primary: "#1DE29B",
                                
              secondary: "#0DC6D1",
                        
              accent: "#00D7C0",
                        
              neutral: "#2B3440",          
              info: "#00B5FF",
              success: "#00A96E",
              warning: "#FFBF01",
              error: "#FF5861",
            },
         
        }],
      darkTheme: "dark", // name of one of the included themes for dark mode
      base: true, // applies background color and foreground color for root element by default
      styled: true, // include daisyUI colors and design decisions for all components
      utils: true, // adds responsive and modifier utility classes
      prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
      logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
      themeRoot: ":root",
      
      },   
          
  plugins: [
     // plugin,
      require('@tailwindcss/typography'),  
      require("daisyui")]
  
}


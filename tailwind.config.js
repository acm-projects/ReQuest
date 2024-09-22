/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
/*
these tell tailwindcss what files it has access too
the ** is to say
The double asterisk (**) is a wildcard that matches any directory level. So, it will look inside app and all its subdirectories, recursively.
*{js,jsx,ts,tsx}:
The * is a wildcard that matches any file name.
{js,jsx,ts,tsx} means it will match files with any of these extensions: .js, .jsx, .ts, and .tsx.
*/
    "./App.{js,jsx,ts,tsx}",
   // "./RecycleRoute//**/*.{js,jsx,ts,tsx}",
    "./(tabs)/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    //might need to add more depending on if you add files
    
  ],
  theme: {
    extend: {
      //fontFamily: {
        //nerkoOne: ["NerkoOne"],
   //   }
    },
  },
  plugins: [],
}


import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#5D87FF',
          secondary: '#49BEFF',
          error: '#FA896B',
          info: '#539BFF',
          success: '#13DEB9',
          warning: '#FFAE1F',
          background: '#F5F5F5'
        }
      }
    }
  }
})

<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        :title="rail ? '' : 'Administrator'"
        :subtitle="rail ? '' : 'RMS'"
        nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="(item, i) in menuItems"
          :key="i"
          :value="item"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar 
      elevation="0"
      rounded="0"
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="rail = !rail"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>RMS</v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Search -->
      <v-text-field
        density="compact"
        hide-details
        prepend-inner-icon="mdi-magnify"
        single-line
        variant="outlined"
        class="search-field"
        placeholder="Suchen..."
      ></v-text-field>

      <v-spacer></v-spacer>

      <!-- Action Buttons -->
      <v-btn icon>
        <v-icon>mdi-bell-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">Benachrichtigungen</v-tooltip>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-cog-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">Einstellungen</v-tooltip>
      </v-btn>

      <!-- User Menu -->
      <v-menu min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-avatar
              color="grey-darken-1"
              size="32"
            >
              <v-img
                src="https://randomuser.me/api/portraits/men/85.jpg"
                alt="Administrator"
              ></v-img>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar
                color="grey-darken-1"
              >
                <v-img
                  src="https://randomuser.me/api/portraits/men/85.jpg"
                  alt="Administrator"
                ></v-img>
              </v-avatar>
              <h3>Administrator</h3>
              <p class="text-caption mt-1">
                admin@beispiel.de
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn
                rounded
                variant="text"
                class="mb-2"
              >
                Profil bearbeiten
              </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn
                rounded
                variant="text"
                color="error"
              >
                Abmelden
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-3">
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)
const rail = ref(true)

const menuItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/'
  },
  {
    title: 'Räume',
    icon: 'mdi-door',
    to: '/rooms'
  },
  {
    title: 'Gebühren',
    icon: 'mdi-currency-eur',
    to: '/fees'
  },
  {
    title: 'Rabatte',
    icon: 'mdi-tag-multiple',
    to: '/discounts'
  },
  {
    title: 'Benutzergruppen',
    icon: 'mdi-account-group',
    to: '/user-groups'
  },
  {
    title: 'Verlauf',
    icon: 'mdi-history',
    to: '/history'
  }
]
</script>

<style>
.search-field {
  max-width: 300px;
}

:root {
  --v-theme-primary: #5D87FF;
  --v-theme-secondary: #49BEFF;
  --v-theme-error: #FA896B;
  --v-theme-info: #539BFF;
  --v-theme-success: #13DEB9;
  --v-theme-warning: #FFAE1F;
}

.v-application {
  background-color: #F5F5F5;
}

.v-card {
  border-radius: 12px;
  box-shadow: rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px !important;
}

.v-toolbar {
  border-radius: 12px;
  margin: 16px;
  width: calc(100% - 32px) !important;
}

.v-btn {
  text-transform: none;
  letter-spacing: 0;
}
</style>

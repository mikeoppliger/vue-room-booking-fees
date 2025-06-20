<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
    >
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        :title="rail ? '' : 'Administrator'"
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
          prepend-icon="mdi-currency-eur"
          title="Gebühren"
          :to="{ name: 'fees' }"
          rounded="lg"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-tag-multiple"
          title="Rabatte"
          :to="{ name: 'discounts' }"
          rounded="lg"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar 
      color="primary" 
      dark
      elevation="0"
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="rail = !rail"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Raumbuchungssystem</v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Settings Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            value="settings"
          >
            <v-list-item-title>Einstellungen</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            value="profile"
          >
            <v-list-item-title>Profil</v-list-item-title>
          </v-list-item>
          <v-list-item
            value="logout"
          >
            <v-list-item-title>Abmelden</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
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

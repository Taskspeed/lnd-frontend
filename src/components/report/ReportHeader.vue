<template>
  <div class="header-wrapper">
    <div class="logo-container">
      <img class="logo" alt="City of Tagum Logo" src="/image/reportLogo.png" />
    </div>

    <div class="header-text-container">
      <div class="republic-text">REPUBLIC OF THE PHILIPPINES</div>
      <div class="province-text">PROVINCE OF DAVAO DEL NORTE</div>
      <div class="city-text">CITY OF TAGUM</div>
    </div>

    <div class="form-no-container">
      <div>{{ formNo }}</div>
      <div>Revision : {{ revision }}</div>
      <div>{{ revisionDate }}</div>
    </div>
  </div>

  <div class="green-banner">
    <div class="office-text">{{ officeText }}</div>
  </div>
</template>

<script setup>
defineProps({
  officeText: {
    type: String,
    default: '',
  },
  formNo: {
    type: String,
    default: 'F-HRM-HRD-0006',
  },
  revision: {
    type: String,
    default: '03',
  },
  revisionDate: {
    type: String,
    default: 'Mar 2025',
  },
})
</script>

<style scoped>
.header-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  background: #fff;
}

.logo-container {
  flex-shrink: 0;
  width: 70px;
  height: 70px;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.header-text-container {
  flex: 1;
  color: #00703c;
}

.republic-text,
.province-text {
  font-size: 8pt;
  font-weight: 500;
  line-height: 1.2;
}

.city-text {
  font-size: 13pt;
  font-weight: bold;
  line-height: 1.3;
  padding-top: 2px;
  text-transform: uppercase;
}

.form-no-container {
  flex-shrink: 0;
  text-align: right;
  font-size: 9pt;
  color: #333;
  line-height: 1.4;
}

.green-banner {
  background-color: #008000;
  color: white;
  min-height: 36px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.office-text {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 12pt;
}
</style>
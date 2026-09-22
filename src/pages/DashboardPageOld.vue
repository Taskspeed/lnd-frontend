<template>
  <q-page class="dashboard-page">
    <!-- =====================================================
         WELCOME BANNER
    ====================================================== -->
    <section class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-label">
          <span class="welcome-dot"></span>
          {{ officeView ? "Office Overview" : "Welcome!" }}
        </div>

        <h1>
          {{ userName }}
          <span class="wave">👋</span>
        </h1>
      </div>

      <div class="welcome-city-hall">
        <img
          src="/image/AnimatedCityHall.png"
          alt="City Hall of Tagum"
          loading="lazy"
        />
      </div>
    </section>

    <!-- =====================================================
         STATISTICS
    ====================================================== -->
    <section class="statistics-grid">
      <!-- Total Events -->
      <q-card flat class="stat-card">
        <div class="stat-icon stat-icon-green">
          <q-icon name="event" size="26px" />
        </div>

        <div class="stat-content">
          <div class="stat-label">Total Events</div>

          <div class="stat-value">24</div>

          <div class="stat-change stat-change-green">
            <q-icon name="arrow_upward" size="13px" />
            +3 this month
          </div>
        </div>

        <div class="stat-arrow">
          <q-icon name="north_east" size="17px" />
        </div>
      </q-card>

      <!-- Participants -->
      <q-card flat class="stat-card">
        <div class="stat-icon stat-icon-blue">
          <q-icon name="groups" size="26px" />
        </div>

        <div class="stat-content">
          <div class="stat-label">Total Participants</div>

          <div class="stat-value">856</div>

          <div class="stat-change stat-change-blue">
            <q-icon name="arrow_upward" size="13px" />
            +128 this month
          </div>
        </div>

        <div class="stat-arrow stat-arrow-blue">
          <q-icon name="north_east" size="17px" />
        </div>
      </q-card>

      <!-- Certificates -->
      <q-card flat class="stat-card">
        <div class="stat-icon stat-icon-yellow">
          <q-icon name="workspace_premium" size="26px" />
        </div>

        <div class="stat-content">
          <div class="stat-label">Certificates Issued</div>

          <div class="stat-value">642</div>

          <div class="stat-change stat-change-yellow">
            <q-icon name="arrow_upward" size="13px" />
            +95 this month
          </div>
        </div>

        <div class="stat-arrow stat-arrow-yellow">
          <q-icon name="north_east" size="17px" />
        </div>
      </q-card>

      <!-- Assessments -->
      <q-card flat class="stat-card">
        <div class="stat-icon stat-icon-purple">
          <q-icon name="assignment" size="26px" />
        </div>

        <div class="stat-content">
          <div class="stat-label">Assessments</div>

          <div class="stat-value">78</div>

          <div class="stat-change stat-change-purple">
            <q-icon name="arrow_upward" size="13px" />
            +12 this month
          </div>
        </div>

        <div class="stat-arrow stat-arrow-purple">
          <q-icon name="north_east" size="17px" />
        </div>
      </q-card>
    </section>

    <!-- =====================================================
         MAIN CONTENT
    ====================================================== -->
    <section class="dashboard-grid">
      <!-- ===================================================
           LEFT COLUMN
      ==================================================== -->
      <div class="dashboard-left">
        <!-- Upcoming Events -->
        <q-card flat class="dashboard-card">
          <div class="card-header">
            <div class="card-title-wrapper">
              <div class="card-icon green">
                <q-icon name="event" size="19px" />
              </div>

              <h2>Upcoming Events</h2>
            </div>

            <q-btn
              flat
              no-caps
              class="view-all-btn"
              label="View All"
              icon-right="chevron_right"
            />
          </div>

          <div class="events-list">
            <!-- Event 1 -->
            <div class="event-item">
              <div class="event-date">
                <div class="event-month">AUG</div>

                <div class="event-day">25</div>
              </div>

              <div class="event-details">
                <div class="event-title">Leadership & Management Training</div>

                <div class="event-meta">
                  <span>
                    <q-icon name="schedule" />
                    8:00 AM – 5:00 PM
                  </span>

                  <span>
                    <q-icon name="location_on" />
                    Ayala Hall, City Hall of Tagum
                  </span>
                </div>
              </div>

              <q-badge
                class="event-status status-scheduled"
                label="Scheduled"
              />
            </div>

            <!-- Event 2 -->
            <div class="event-item">
              <div class="event-date">
                <div class="event-month">AUG</div>

                <div class="event-day">28</div>
              </div>

              <div class="event-details">
                <div class="event-title">Digital Transformation Seminar</div>

                <div class="event-meta">
                  <span>
                    <q-icon name="schedule" />
                    9:00 AM – 4:00 PM
                  </span>

                  <span>
                    <q-icon name="location_on" />
                    Atrium, City Hall of Tagum
                  </span>
                </div>
              </div>

              <q-badge
                class="event-status status-registration"
                label="Open for Registration"
              />
            </div>

            <!-- Event 3 -->
            <div class="event-item">
              <div class="event-date">
                <div class="event-month">SEP</div>

                <div class="event-day">05</div>
              </div>

              <div class="event-details">
                <div class="event-title">Public Service Ethics</div>

                <div class="event-meta">
                  <span>
                    <q-icon name="schedule" />
                    8:30 AM – 4:30 PM
                  </span>

                  <span>
                    <q-icon name="location_on" />
                    AVR 4, City Hall of Tagum
                  </span>
                </div>
              </div>

              <q-badge
                class="event-status status-approval"
                label="For Approval"
              />
            </div>

            <!-- Event 4 -->
            <div class="event-item">
              <div class="event-date">
                <div class="event-month">SEP</div>

                <div class="event-day">25</div>
              </div>

              <div class="event-details">
                <div class="event-title">
                  Basic Data Privacy and Cybersecurity Awareness
                </div>

                <div class="event-meta">
                  <span>
                    <q-icon name="schedule" />
                    8:00 AM – 5:00 PM
                  </span>

                  <span>
                    <q-icon name="location_on" />
                    AVR 5, City Hall of Tagum
                  </span>
                </div>
              </div>

              <q-badge
                class="event-status status-approval"
                label="For Approval"
              />
            </div>
          </div>
        </q-card>
      </div>

      <!-- ===================================================
           RIGHT COLUMN
      ==================================================== -->
      <div class="dashboard-right">
        <!-- Calendar -->
        <q-card flat class="dashboard-card calendar-card">
          <div class="card-header">
            <div class="card-title-wrapper">
              <div class="card-icon green">
                <q-icon name="calendar_month" size="19px" />
              </div>

              <h2>Calendar</h2>
            </div>

            <div class="calendar-controls">
              <q-btn flat round dense icon="chevron_left" size="sm" />

              <strong> August 2026 </strong>

              <q-btn flat round dense icon="chevron_right" size="sm" />

              <q-btn outline no-caps dense label="Today" class="today-btn" />
            </div>
          </div>

          <div class="calendar">
            <div class="calendar-weekdays">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div class="calendar-days">
              <!-- Previous month -->
              <div class="calendar-day muted">26</div>

              <div class="calendar-day muted">27</div>

              <div class="calendar-day muted">28</div>

              <div class="calendar-day muted">29</div>

              <div class="calendar-day muted">30</div>

              <div class="calendar-day muted">31</div>

              <div class="calendar-day">
                1
                <span class="calendar-dot green-dot"></span>
              </div>

              <div class="calendar-day">2</div>

              <div class="calendar-day">
                3
                <span class="calendar-dot green-dot"></span>
              </div>

              <div class="calendar-day">4</div>

              <div class="calendar-day">5</div>

              <div class="calendar-day">6</div>

              <div class="calendar-day">7</div>

              <div class="calendar-day">8</div>

              <div class="calendar-day">9</div>

              <div class="calendar-day">
                10
                <span class="calendar-dot purple-dot"></span>
              </div>

              <div class="calendar-day">
                11
                <span class="calendar-dot blue-dot"></span>
              </div>

              <div class="calendar-day">
                12
                <span class="calendar-dot yellow-dot"></span>
              </div>

              <div class="calendar-day">13</div>

              <div class="calendar-day">
                14
                <span class="calendar-dot purple-dot"></span>
              </div>

              <div class="calendar-day">15</div>

              <div class="calendar-day">16</div>

              <div class="calendar-day">17</div>

              <div class="calendar-day">18</div>

              <div class="calendar-day">19</div>

              <div class="calendar-day">20</div>

              <div class="calendar-day">21</div>

              <div class="calendar-day">22</div>

              <div class="calendar-day">23</div>

              <div class="calendar-day">24</div>

              <div class="calendar-day today">25</div>

              <div class="calendar-day">26</div>

              <div class="calendar-day">
                27
                <span class="calendar-dot blue-dot"></span>
              </div>

              <div class="calendar-day">
                28
                <span class="calendar-dot yellow-dot"></span>
              </div>

              <div class="calendar-day">29</div>

              <div class="calendar-day">30</div>

              <div class="calendar-day">31</div>

              <!-- September -->
              <div class="calendar-day muted">1</div>

              <div class="calendar-day muted">2</div>

              <div class="calendar-day muted">3</div>

              <div class="calendar-day muted">4</div>

              <div class="calendar-day muted">5</div>
            </div>
          </div>
        </q-card>
      </div>
    </section>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "DashboardPage",

  props: {
    officeView: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const userName = ref("Admin");

    return {
      userName,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.dashboard-page {
  padding: 18px 20px 12px;

  background: radial-gradient(
      circle at 100% 0%,
      rgba(57, 181, 74, 0.07),
      transparent 28%
    ),
    #f8f9fa;

  color: #f0efef;
}

/* =========================================================
   WELCOME BANNER
========================================================= */

.welcome-banner {
  position: relative;

  min-height: 155px;

  overflow: hidden;

  display: flex;

  align-items: center;

  padding: 28px 38px;

  border-radius: 14px;

  background: linear-gradient(110deg, #c3f8ce 0%, #c5f3d0 48%, #41c451 100%);

  box-shadow: 0 4px 14px rgba(36, 100, 55, 0.06);
}

.welcome-banner::after {
  content: "";

  position: absolute;

  width: 420px;
  height: 420px;

  right: 120px;
  top: -260px;

  border-radius: 50%;

  border: 80px solid rgba(255, 255, 255, 0.16);
}

.welcome-content {
  position: relative;

  z-index: 2;
}

.welcome-label {
  display: flex;

  align-items: center;

  gap: 9px;

  color: #087b41;

  font-size: 14px;
}

.welcome-dot {
  width: 10px;
  height: 10px;

  border-radius: 50%;

  background: #18ad4e;
}

.welcome-content h1 {
  margin: 4px 0 4px;

  font-size: 31px;

  line-height: 1.1;

  font-weight: 750;

  color: #102c40;
}

.wave {
  font-size: 26px;
}

.welcome-content p {
  margin: 0;

  color: #55717c;

  font-size: 13px;
}

.welcome-city-hall {
  position: absolute;

  right: 15px;
  bottom: -8px;

  width: 250px;

  z-index: 1;
}

.welcome-city-hall img {
  width: 100%;

  display: block;
}

/* =========================================================
   STATISTICS
========================================================= */

.statistics-grid {
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 16px;

  margin-top: 18px;
}

.stat-card {
  position: relative;

  min-height: 116px;

  display: flex;

  align-items: center;

  padding: 18px;

  border-radius: 13px;

  background: #ffffff;

  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);

  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 7px 18px rgba(30, 70, 42, 0.09);
}

.stat-icon {
  width: 62px;
  height: 62px;

  min-width: 62px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 13px;

  color: #ffffff;
}

.stat-icon-green {
  background: linear-gradient(135deg, #0fc449, #18a94d);
}

.stat-icon-blue {
  background: linear-gradient(135deg, #159bf0, #0879d8);
}

.stat-icon-yellow {
  background: linear-gradient(135deg, #ffbe35, #f4a900);
}

.stat-icon-purple {
  background: linear-gradient(135deg, #8e52df, #7341c9);
}

.stat-content {
  margin-left: 15px;
}

.stat-label {
  color: #687a83;

  font-size: 12px;
}

.stat-value {
  margin-top: 2px;

  color: #14283b;

  font-size: 27px;

  line-height: 1.1;

  font-weight: 750;
}

.stat-change {
  display: flex;

  align-items: center;

  gap: 2px;

  margin-top: 5px;

  font-size: 10px;
}

.stat-change-green {
  color: #12a34a;
}

.stat-change-blue {
  color: #087ed8;
}

.stat-change-yellow {
  color: #e9a400;
}

.stat-change-purple {
  color: #8149d4;
}

.stat-arrow {
  position: absolute;

  right: 15px;
  bottom: 15px;

  width: 29px;
  height: 29px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #15a64b;

  background: #effaf1;
}

.stat-arrow-blue {
  color: #158de0;
  background: #eef8ff;
}

.stat-arrow-yellow {
  color: #e5a000;
  background: #fff8e8;
}

.stat-arrow-purple {
  color: #8248d5;
  background: #f6f0ff;
}

/* =========================================================
   DASHBOARD GRID
========================================================= */

.dashboard-grid {
  display: grid;

  grid-template-columns: 1.45fr 1fr;

  gap: 16px;

  margin-top: 18px;
}

.dashboard-left,
.dashboard-right {
  display: flex;

  flex-direction: column;

  gap: 16px;
}

.dashboard-card {
  border-radius: 13px;

  background: #ffffff;

  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

.card-header {
  min-height: 62px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 14px 20px;
}

.card-title-wrapper {
  display: flex;

  align-items: center;

  gap: 11px;
}

.card-title-wrapper h2 {
  margin: 0;

  color: #19354a;

  font-size: 16px;

  font-weight: 700;
}

.card-icon {
  width: 32px;
  height: 32px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.card-icon.green {
  background: #eaf8ed;

  color: #078744;
}

.card-icon.dark {
  background: #edf3f5;

  color: #19384b;
}

.view-all-btn {
  color: #099044;

  font-size: 11px;
}

/* =========================================================
   EVENTS
========================================================= */

.events-list {
  padding: 0 16px 15px;
}

.event-item {
  min-height: 84px;

  display: flex;

  align-items: center;

  gap: 14px;

  padding: 9px 8px;

  border: 1px solid #edf1ef;

  border-radius: 10px;

  margin-top: 9px;
}

.event-date {
  width: 76px;
  min-width: 76px;

  overflow: hidden;

  text-align: center;

  border: 1px solid #e2ebe4;

  border-radius: 8px;

  background: #ffffff;
}

.event-month {
  padding: 5px;

  color: #ffffff;

  background: linear-gradient(90deg, #18b64d, #0ca344);

  font-size: 10px;

  font-weight: 700;
}

.event-day {
  padding: 5px;

  color: #172d3f;

  font-size: 20px;

  font-weight: 750;
}

.event-details {
  flex: 1;

  min-width: 0;
}

.event-title {
  color: #18344a;

  font-size: 12px;

  font-weight: 700;
}

.event-meta {
  display: flex;

  flex-wrap: wrap;

  gap: 10px;

  margin-top: 7px;

  color: #718089;

  font-size: 10px;
}

.event-meta span {
  display: flex;

  align-items: center;

  gap: 3px;
}

.event-meta .q-icon {
  font-size: 14px;
}

.event-status {
  padding: 7px 11px;

  border-radius: 20px;

  font-size: 9px;

  font-weight: 650;
}

.status-scheduled {
  color: #0c9145;

  background: #e1f7e6;
}

.status-registration {
  color: #087bd5;

  background: #e1f3ff;
}

.status-approval {
  color: #dc9b00;

  background: #fff2cf;
}

/* =========================================================
   ACTIVITIES
========================================================= */

.activities-card {
  padding-bottom: 6px;
}

.activities-list {
  padding: 0 20px;
}

.activity-item {
  position: relative;

  display: flex;

  align-items: flex-start;

  padding: 11px 0;

  border-top: 1px solid #edf1ef;
}

.activity-dot {
  width: 10px;
  height: 10px;

  min-width: 10px;

  margin: 4px 12px 0 1px;

  border-radius: 50%;
}

.activity-green {
  background: #20bb4e;
}

.activity-blue {
  background: #1598ec;
}

.activity-yellow {
  background: #ffb515;
}

.activity-content {
  color: #435966;

  font-size: 11px;
}

.activity-content strong {
  color: #203b4e;
}

.activity-content small {
  display: block;

  margin-top: 3px;

  color: #8a969c;

  font-size: 9px;
}

/* =========================================================
   CALENDAR
========================================================= */

.calendar-card {
  min-height: 348px;
}

.calendar-controls {
  display: flex;

  align-items: center;

  gap: 8px;
}

.calendar-controls strong {
  min-width: 88px;

  text-align: center;

  color: #253a4b;

  font-size: 12px;
}

.today-btn {
  margin-left: 4px;

  padding: 0 9px;

  color: #52666f;

  border-color: #e2e9e5;

  border-radius: 7px;

  font-size: 10px;
}

.calendar {
  padding: 0 18px 18px;
}

.calendar-weekdays,
.calendar-days {
  display: grid;

  grid-template-columns: repeat(7, 1fr);
}

.calendar-weekdays {
  padding: 10px 0 20px;

  color: #71838d;

  font-size: 10px;

  text-align: center;
}

.calendar-days {
  border: 1px solid #edf1ef;

  border-bottom: none;
}

.calendar-day {
  position: relative;

  min-height: 55px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-right: 1px solid #edf1ef;

  border-bottom: 1px solid #edf1ef;

  color: #243b4c;

  font-size: 10px;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day.muted {
  color: #aeb7bb;
}

.calendar-day.today {
  width: 34px;
  height: 34px;

  min-height: 34px;

  align-self: center;
  justify-self: center;

  border: none;

  border-radius: 50%;

  background: linear-gradient(135deg, #16b54c, #0b9343);

  color: #ffffff;

  font-weight: 700;
}

.calendar-dot {
  position: absolute;

  bottom: 5px;

  width: 5px;
  height: 5px;

  border-radius: 50%;
}

.green-dot {
  background: #16b84d;
}

.blue-dot {
  background: #1999e8;
}

.yellow-dot {
  background: #ffbf26;
}

.purple-dot {
  background: #8c52d9;
}

/* =========================================================
   LEARNING CARD
========================================================= */

.learning-card {
  position: relative;

  min-height: 166px;

  overflow: hidden;

  display: flex;

  align-items: center;

  padding: 20px;

  border-radius: 13px;

  background: #ffffff;

  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

.learning-content {
  position: relative;

  z-index: 2;

  display: flex;

  align-items: flex-start;

  gap: 13px;

  max-width: 62%;
}

.learning-icon {
  width: 58px;
  height: 58px;

  min-width: 58px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #087c42;

  background: #dff5ff;
}

.learning-title {
  color: #12436b;

  font-size: 14px;

  line-height: 1.35;

  font-weight: 750;
}

.learning-text p {
  margin: 5px 0 0;

  color: #71818a;

  font-size: 10px;

  line-height: 1.4;
}

.learning-illustration {
  position: absolute;

  right: 5px;
  bottom: -5px;

  width: 190px;
  height: 130px;
}

.growth-bars {
  position: absolute;

  left: 18px;
  bottom: 15px;

  display: flex;

  align-items: flex-end;

  gap: 4px;
}

.growth-bars span {
  width: 12px;

  background: #1687d9;

  border-radius: 2px 2px 0 0;
}

.growth-bars span:nth-child(1) {
  height: 25px;
}

.growth-bars span:nth-child(2) {
  height: 38px;
}

.growth-bars span:nth-child(3) {
  height: 54px;
}

.growth-arrow {
  position: absolute;

  left: 52px;
  top: 28px;

  color: #13a847;

  font-size: 44px;

  font-weight: 700;
}

.growth-leaf {
  position: absolute;

  background: linear-gradient(135deg, #58d84c, #079647);

  border-radius: 100% 0 100% 0;

  transform: rotate(-28deg);
}

.leaf-one {
  width: 70px;
  height: 30px;

  right: 55px;
  bottom: 42px;
}

.leaf-two {
  width: 58px;
  height: 27px;

  right: 35px;
  bottom: 67px;

  transform: rotate(42deg);
}

.mini-cap {
  position: absolute;

  top: 10px;
  right: 73px;

  color: #087b43;
}

.mini-bulb {
  position: absolute;

  right: 5px;
  top: 24px;

  color: #f4ad00;
}

/* =========================================================
   FOOTER
========================================================= */

.dashboard-footer {
  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 13px 3px 3px;

  color: #8c999e;

  font-size: 9px;
}

.footer-developer {
  display: flex;

  align-items: center;

  gap: 7px;
}

.footer-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: #12b34b;
}

/* =========================================================
   LARGE TABLET
========================================================= */

@media (max-width: 1200px) {
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .welcome-city-hall {
    width: 280px;
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 900px) {
  .dashboard-page {
    padding: 14px;
  }

  .welcome-banner {
    min-height: 145px;

    padding: 25px;
  }

  .welcome-city-hall {
    width: 250px;

    right: -15px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .dashboard-page {
    padding: 10px;
  }

  .welcome-banner {
    min-height: 180px;

    padding: 22px;

    align-items: flex-start;
  }

  .welcome-content h1 {
    font-size: 25px;
  }

  .welcome-content p {
    max-width: 230px;

    font-size: 11px;
  }

  .welcome-city-hall {
    width: 210px;

    right: -15px;

    bottom: -3px;

    opacity: 0.95;
  }

  .statistics-grid {
    grid-template-columns: 1fr;

    gap: 10px;
  }

  .stat-card {
    min-height: 100px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;

    gap: 10px;
  }

  .dashboard-left,
  .dashboard-right {
    gap: 10px;
  }

  .event-item {
    align-items: flex-start;

    flex-wrap: wrap;
  }

  .event-details {
    min-width: calc(100% - 105px);
  }

  .event-status {
    margin-left: 90px;
  }

  .calendar-controls strong {
    min-width: auto;
  }

  .today-btn {
    display: none;
  }

  .calendar-day {
    min-height: 38px;
  }

  .learning-content {
    max-width: 72%;
  }

  .learning-illustration {
    right: -25px;

    opacity: 0.7;
  }

  .dashboard-footer {
    flex-direction: column;

    gap: 7px;

    text-align: center;
  }
}

/* =========================================================
   VERY SMALL MOBILE
========================================================= */

@media (max-width: 400px) {
  .welcome-city-hall {
    width: 180px;
  }

  .welcome-content h1 {
    font-size: 22px;
  }

  .welcome-content p {
    font-size: 10px;
  }

  .stat-icon {
    width: 52px;
    height: 52px;

    min-width: 52px;
  }

  .stat-value {
    font-size: 23px;
  }

  .event-date {
    width: 62px;
    min-width: 62px;
  }

  .event-title {
    font-size: 11px;
  }

  .event-meta {
    flex-direction: column;

    gap: 3px;
  }

  .learning-illustration {
    opacity: 0.35;
  }
}
</style>

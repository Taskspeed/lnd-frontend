<template>
  <q-page class="create-event-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <EventPageHeader title="Create Event" subtitle="Fill in the details to create a new event" @back="goBack" />

    <!-- =========================================================
         ERROR BANNER
    ========================================================== -->
    <q-banner v-if="eventStore.error" dense rounded class="bg-red-2 text-red-9 error-banner">
      {{ eventStore.error }}
    </q-banner>

    <!-- =========================================================
         MAIN CONTENT
    ========================================================== -->
    <EventTwoColumnLayout>
      <!-- =======================================================
           LEFT PANEL
      ======================================================== -->
      <template #left>
        <div class="section-title">Event</div>

        <!-- TITLE -->
        <LabeledField label="Title">
          <q-select v-model="eventForm.title_name" outlined dense use-input hide-selected fill-input
            input-debounce="400" new-value-mode="add-unique" :options="titleOptions" :loading="titleLoading"
            @filter="filterTitles" @input-value="onTitleInput" popup-content-class="title-dropdown-scroll"
            placeholder="Enter event title" class="custom-input" />
        </LabeledField>

        <div class="section-divider"></div>

        <!-- FORM SCHEDULE -->
        <div class="form-schedule">
          <LabeledField label="Form Open Time">
            <q-input :model-value="formatFormDate(eventForm.form_open_date)" outlined dense readonly
              placeholder="Select open date & time" class="custom-input">
              <template #append>
                <q-icon v-if="eventForm.form_open_date" name="close" class="time-picker-icon"
                  @click.stop="eventForm.form_open_date = null" />
                <q-icon v-else name="event" class="time-picker-icon">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <div class="row no-wrap">
                      <q-date v-model="eventForm.form_open_date" mask="YYYY-MM-DD HH:mm" color="green" />
                      <q-time v-model="eventForm.form_open_date" mask="YYYY-MM-DD HH:mm" color="green" />
                    </div>
                    <div class="row items-center justify-end q-pa-sm">
                      <q-btn v-close-popup label="Done" color="green" flat no-caps />
                    </div>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </LabeledField>

          <LabeledField label="Form Due Time">
            <q-input :model-value="formatFormDate(eventForm.form_due_date)" outlined dense readonly
              placeholder="Select due date & time" class="custom-input">
              <template #append>
                <q-icon v-if="eventForm.form_due_date" name="close" class="time-picker-icon"
                  @click.stop="eventForm.form_due_date = null" />
                <q-icon v-else name="event" class="time-picker-icon">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <div class="row no-wrap">
                      <q-date v-model="eventForm.form_due_date" mask="YYYY-MM-DD HH:mm" color="green" />
                      <q-time v-model="eventForm.form_due_date" mask="YYYY-MM-DD HH:mm" color="green" />
                    </div>
                    <div class="row items-center justify-end q-pa-sm">
                      <q-btn v-close-popup label="Done" color="green" flat no-caps />
                    </div>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </LabeledField>
        </div>
        <div class="section-title forms-title">Forms</div>
        <div class="competency-group">
          <div class="forms-list">
            <q-checkbox v-for="option in formsOptions" :key="option.value" v-model="eventForm.forms" :val="option.value"
              :label="option.label" color="green" keep-color dense class="competency-checkbox" />
          </div>
        </div>

        <div class="section-divider"></div>

        <div class="section-title forms-title">Evaluation</div>
        <div class="competency-group">
          <div class="forms-list">
            <q-checkbox v-for="option in evaluationOptions" :key="option.value" v-model="eventForm.evaluations"
              :val="option.value" :label="option.label" color="green" keep-color dense class="competency-checkbox" />
          </div>
        </div>

        <div class="section-divider"></div>
        <div class="section-title forms-title">ARMS</div>
        <div class="arms-card" :class="{ 'arms-card--on': eventForm.sync_to_arms }">
          <div class="arms-card-info">
            <q-icon name="sync_alt" size="20px" class="arms-card-icon" />
            <div>
              <div class="arms-card-title">Create event on ARMS</div>
              <div class="arms-card-desc">
                When turned on, this event will also be created on ARMS once it is saved.
              </div>
            </div>
          </div>
          <q-toggle v-model="eventForm.sync_to_arms" color="green" keep-color />
        </div>

        <div v-if="eventForm.sync_to_arms" class="arms-hint">
          <q-icon name="info" size="25px" color="blue-7" />
          <span class="arms-hint-text">Make sure the Venue, Schedule Date, and Department are complete.</span>
        </div>
        <div class="section-divider"></div>

        <!-- =====================================================
             ASSESSMENT (summary lang dito, ang setup ay nasa modal)
        ====================================================== -->
       <div class="assessment-header">
  <div class="section-title forms-title">Assessment</div>

  <div class="assessment-header-actions">
    <q-btn v-if="assessmentCount === 0" outline no-caps icon="add" label="Create Assessment"
      class="create-assessment-btn" @click="openAssessmentDialog" />
    <template v-else>
      <q-btn outline no-caps dense icon="edit" label="Edit Assessment" class="create-assessment-btn"
        @click="openAssessmentDialog" />
      <q-btn flat no-caps dense icon="close" label="Remove" class="remove-assessment-btn"
        @click="removeAllAssessments" />
    </template>
  </div>
</div>

<!-- OPEN / CLOSE TOGGLE (labas ng header at ng modal) -->
<div v-if="assessmentCount > 0" class="arms-card assessment-toggle-card"
  :class="eventForm.is_assessment_open ? 'arms-card--on' : 'arms-card--off'">
  <div class="arms-card-info">
    <q-icon :name="eventForm.is_assessment_open ? 'lock_open' : 'lock'"
      :color="eventForm.is_assessment_open ? 'green-7' : 'red-7'" size="20px" class="arms-card-icon" />
    <div class="arms-card-desc">
      {{ eventForm.is_assessment_open
        ? 'The assessment is open. Employees can now answer the tests.'
        : 'The assessment is closed. Turn this on to make it available to employees.' }}
    </div>
  </div>
  <q-toggle v-model="eventForm.is_assessment_open" :color="eventForm.is_assessment_open ? 'green' : 'red'"
    keep-color />
</div>

<div v-if="assessmentCount > 0" class="assessment-summary">
  <div v-for="test in assessmentTests" :key="test.key" class="assessment-summary-row">
    <q-icon :name="eventForm[test.formKey] || eventForm[test.linkKey] ? 'check_circle' : 'radio_button_unchecked'"
      :color="eventForm[test.formKey] || eventForm[test.linkKey] ? 'green-7' : 'grey-5'" size="18px" />
    <span class="assessment-summary-label">{{ test.label }}</span>
    <span class="assessment-summary-meta">{{ testStatus(test) }}</span>
  </div>
</div>
      </template>

      <!-- =======================================================
           RIGHT PANEL
      ======================================================== -->
      <template #right>
        <div class="section-title">Schedule Details</div>
        <LabeledField label="Venue">
          <q-select v-model="eventForm.venue_name" outlined dense use-input hide-selected fill-input
            input-debounce="400" new-value-mode="add-unique" :options="venueOptions" :loading="venueLoading"
            @filter="filterVenues" @input-value="onVenuesInput" placeholder="Enter event venue"
            popup-content-class="title-dropdown-scroll" class="custom-input" />

        </LabeledField>
        <!-- type and category -->
        <div class="two-column-fields">
          <LabeledField label="Learning type">
            <q-select v-model="eventForm.intervention_name" outlined dense emit-value map-options
              :options="interventionOptions" placeholder="Select Intervention" class="custom-input" :display-value="eventForm.intervention_name ? undefined : 'Select Intervention'
                " />
          </LabeledField>
          <!-- SOURCE (DROPDOWN) -->

          <LabeledField label="Source">
            <q-select v-model="eventForm.source_name" outlined dense emit-value map-options :options="sourceOptions"
              placeholder="Select Source" class="custom-input"
              :display-value="eventForm.source_name ? undefined : 'Select Source'" />
          </LabeledField>

          <LabeledField label="Competency">
            <q-select v-model="eventForm.category_name" outlined dense use-input hide-selected fill-input
              input-debounce="400" new-value-mode="add-unique" :options="categoryOptions" :loading="categoryLoading"
              @filter="filterCategory" @input-value="onCategoryInput" popup-content-class="title-dropdown-scroll"
              placeholder="Enter event category" class="custom-input" />
          </LabeledField>
          <LabeledField label="Hours">
            <q-input v-model.number="eventForm.hours" type="number" outlined dense min="0"
              placeholder="Enter number of hours" class="custom-input" />
          </LabeledField>
          <LabeledField label="Activity">
            <q-select v-model="eventForm.type_name" outlined dense use-input hide-selected fill-input
              input-debounce="400" new-value-mode="add-unique" :options="typeOptions" :loading="typeLoading"
              @filter="filterType" @input-value="onTypeInput" placeholder="Enter event type"
              popup-content-class="title-dropdown-scroll" class="custom-input" />
          </LabeledField>

          <LabeledField label="Conductor">
            <q-input v-model.number="eventForm.conducted_by" type="string" outlined dense placeholder="Enter conductor"
              class="custom-input" />
          </LabeledField>

          <LabeledField label="Mode">
            <q-select v-model="eventForm.mode_name" outlined dense use-input hide-selected fill-input
              input-debounce="400" new-value-mode="add-unique" :options="modeOptions" :loading="modeLoading"
              @filter="filterModes" @input-value="onModesInput" placeholder="Enter event mode"
              popup-content-class="title-dropdown-scroll" class="custom-input" />
          </LabeledField>


          <LabeledField label="Fee">
            <q-input v-model="eventForm.fee" outlined dense placeholder="e.g Php 4000" class="custom-input" />
          </LabeledField>

          <!-- Full width, nasa labas ng two-column grid cell -->
          <div class="qualifications-field">
            <!-- SALARY GRADE ROW -->
            <div class="sg-row">
              <div class="sg-row-info">
                <span class="sg-row-label">Salary Grade:</span>
                <q-chip v-if="sgLabel" dense removable color="green-1" text-color="green-9" class="sg-chip"
                  @remove="clearSg">
                  {{ sgLabel }}
                </q-chip>
                <span v-else class="sg-row-empty">Not set</span>
              </div>

              <q-btn outline no-caps dense icon="tune" :label="sgLabel ? 'Edit SG' : 'Set Salary Grade'"
                class="sg-set-btn" @click="openSgDialog" />
            </div>

            <LabeledField label="Qualifications">
              <q-input v-model="eventForm.qualifications" outlined type="textarea" rows="4"
                placeholder="Enter qualifications" class="qualifications-input" />
            </LabeledField>
          </div>
        </div>

        <!-- COMPETENCY -->
        <div class="section-divider"></div>
        <div class="section-title forms-title">Competency</div>

        <div class="competency-groups">
          <div class="competency-group">
            <div class="competency-group-title">Core</div>
            <div class="competency-grid">
              <q-checkbox v-for="option in coreOptions" :key="option.value" v-model="eventForm.competencies"
                :val="option.value" :label="option.label" color="green" keep-color dense class="competency-checkbox" />
            </div>
          </div>

          <div class="competency-group">
            <div class="competency-group-title">Technical</div>
            <div class="competency-grid">
              <q-checkbox v-for="option in technicalOptions" :key="option.value" v-model="eventForm.competencies"
                :val="option.value" :label="option.label" color="green" keep-color dense class="competency-checkbox" />
            </div>
          </div>

          <div class="competency-group">
            <div class="competency-group-title">Leadership</div>
            <div class="competency-grid">
              <q-checkbox v-for="option in leadershipOptions" :key="option.value" v-model="eventForm.competencies"
                :val="option.value" :label="option.label" color="green" keep-color dense class="competency-checkbox" />
            </div>
          </div>
        </div>

        <!-- TABS: SCHEDULE DATE & DEPARTMENT -->
        <q-tabs v-model="activeTab" dense class="tab-navigation" active-color="green" indicator-color="green"
          align="left" narrow-indicator>
          <q-tab name="schedule" label="Schedule Date" />
          <q-tab name="department" label="Department" />
        </q-tabs>

        <q-separator />

        <!-- TAB PANELS -->
        <q-tab-panels v-model="activeTab" animated class="tab-panels">
          <!-- SCHEDULE TAB -->
          <q-tab-panel name="schedule" class="tab-panel">
            <div class="schedule-heading-row">
              <div>
                <div v-if="selectedDateRange" class="selected-date-range">
                  {{ selectedDateRange }}
                </div>
                <div v-else class="selected-date-range empty">
                  No dates selected
                </div>
              </div>

              <q-btn outline no-caps icon="calendar_month" label="Select Date" class="select-date-btn"
                @click="openDateDialog" />
            </div>

            <!-- SCHEDULE TABLE -->
            <div class="schedule-table">
              <div class="schedule-table-header">
                <div class="date-column-text">Date</div>
                <div class="time-column-text">Morning - Afternoon</div>
                <div class="action-column">Action</div>
              </div>

              <div v-for="(schedule, index) in eventForm.schedules" :key="schedule.id" class="schedule-item">
                <!-- DATE / TIME ROW -->
                <div class="schedule-row">
                  <div class="date-column schedule-date">
                    <q-icon name="calendar_today" size="15px" />
                    <span>{{ schedule.date }}</span>
                  </div>

                  <div class="time-column">
                    <div class="time-inputs">
                      <q-input :model-value="formatTimeDisplay(schedule.morning_in)" outlined dense
                        placeholder="Morning In" class="time-input">
                        <template #append>
                          <q-icon v-if="schedule.morning_in" name="close" class="time-picker-icon time-clear-icon"
                            @click.stop="schedule.morning_in = null" />
                          <q-icon v-else name="access_time" class="time-picker-icon">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <!-- Morning In: AM only -->
                              <q-time v-model="schedule.morning_in" mask="HH:mm" color="green" :options="amOnly">

                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="green" flat no-caps />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>

                      <q-input :model-value="formatTimeDisplay(schedule.morning_out)" outlined dense
                        placeholder="Morning Out" class="time-input">
                        <template #append>
                          <q-icon v-if="schedule.morning_out" name="close" class="time-picker-icon time-clear-icon"
                            @click.stop="schedule.morning_out = null" />
                          <q-icon v-else name="access_time" class="time-picker-icon">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="schedule.morning_out" mask="HH:mm" color="green">
                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="green" flat no-caps />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>

                      <span class="time-separator">-</span>

                      <q-input :model-value="formatTimeDisplay(schedule.afternoon_in)" outlined dense
                        placeholder="Afternoon In" class="time-input">
                        <template #append>
                          <q-icon v-if="schedule.afternoon_in" name="close" class="time-picker-icon time-clear-icon"
                            @click.stop="schedule.afternoon_in = null" />
                          <q-icon v-else name="access_time" class="time-picker-icon">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="schedule.afternoon_in" mask="HH:mm" color="green" :options="pmOnly">
                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="green" flat no-caps />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                      <q-input :model-value="formatTimeDisplay(schedule.afternoon_out)" outlined dense
                        placeholder="Afternoon Out" class="time-input">
                        <template #append>
                          <q-icon v-if="schedule.afternoon_out" name="close" class="time-picker-icon time-clear-icon"
                            @click.stop="schedule.afternoon_out = null" />
                          <q-icon v-else name="access_time" class="time-picker-icon">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="schedule.afternoon_out" mask="HH:mm" color="green">
                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="green" flat no-caps />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>

                  <!-- Action Column -->
                  <div class="action-column">
                    <q-btn flat round dense icon="delete_outline" class="delete-btn" @click="removeSchedule(index)">
                      <q-tooltip>Remove Date</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <!-- RESOURCE SPEAKERS PER DATE -->
                <div class="schedule-speakers">
                  <div class="schedule-speakers-label">Resource Speaker/s</div>

                  <div v-for="(speaker, sIndex) in schedule.speakers" :key="speaker.id" class="speaker-row">
                    <q-input v-model="speaker.name" outlined dense placeholder="Enter resource speaker"
                      class="custom-input speaker-input" />
                    <q-input v-model="speaker.position" outlined dense placeholder="Position"
                      class="custom-input speaker-agency-input" />
                    <q-input v-model="speaker.agency" outlined dense placeholder="Agency"
                      class="custom-input speaker-agency-input" />

                    <q-btn v-if="schedule.speakers.length > 1" flat round dense icon="close" class="remove-speaker-btn"
                      @click="removeScheduleSpeaker(schedule, sIndex)">
                      <q-tooltip>Remove Speaker</q-tooltip>
                    </q-btn>
                  </div>

                  <div class="speaker-action-row">
                    <q-btn outline no-caps dense icon="add" label="Add Speaker" class="add-speaker-btn"
                      @click="addScheduleSpeaker(schedule)" />
                    <q-btn v-if="eventForm.schedules.length > 1" flat no-caps dense icon="content_copy"
                      label="Copy to all dates" class="copy-speaker-btn" @click="copySpeakersToAll(index)" />
                  </div>
                </div>
              </div>

              <div v-if="!eventForm.schedules.length" class="schedule-empty">
                <q-icon name="calendar_month" size="28px" />
                <span>Select a date to create a schedule</span>
              </div>
            </div>
          </q-tab-panel>

          <!-- DEPARTMENT TAB -->
          <q-tab-panel name="department" class="tab-panel">
            <div class="department-header">
              <div class="attendee-count-wrapper">
                <div class="attendee-count">
                  Total of Attendees:
                  <strong>{{ totalAttendees }}</strong>
                </div>
              </div>

              <div class="add-department-wrapper">
                <q-btn outline no-caps icon="add" label="Add Department" class="add-department-btn"
                  @click="openDepartmentDialog" />
              </div>
            </div>

            <q-input v-model="departmentSearch" outlined dense clearable placeholder="Search and add a department"
              class="department-search">
              <template #prepend>
                <q-icon name="search" size="17px" />
              </template>
            </q-input>

            <!-- Department Table with Pagination -->
            <div class="department-table-container">
              <q-table :rows="filteredDepartments" :columns="departmentColumns" row-key="id"
                :rows-per-page-options="[5, 10, 25]" v-model:pagination="departmentPagination" class="department-table"
                flat bordered>
                <!-- Department Name Column -->
                <template #body-cell-name="props">
                  <q-td :props="props">
                    <div class="department-name-cell">
                      {{ props.row.name }}
                    </div>
                  </q-td>
                </template>

                <!-- Attendees Column -->
                <template #body-cell-attendees="props">
                  <q-td :props="props">
                    <q-input v-model.number="props.row.attendees" type="number" min="0" outlined dense
                      class="attendee-input-main" />
                  </q-td>
                </template>

                <!-- Action Column -->
                <template #body-cell-action="props">
                  <q-td :props="props">
                    <div class="action-btn-group">
                      <q-btn flat round dense icon="visibility" color="primary"
                        @click="openDepartmentEmployeesDialog(props.row)">
                        <q-tooltip>View Selected Employees</q-tooltip>
                      </q-btn>

                      <q-btn flat round dense icon="delete_outline" class="delete-btn"
                        @click="removeDepartment(props.rowIndex)">
                        <q-tooltip>Remove Department</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>

                <!-- No Data State -->
                <template #no-data>
                  <div class="empty-state">
                    <q-icon name="business" size="32px" color="grey-4" />
                    <div>No departments added.</div>
                  </div>
                </template>
              </q-table>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </EventTwoColumnLayout>

    <!-- =========================================================
         BOTTOM ACTIONS
    ========================================================== -->
    <div class="page-actions">
      <q-btn flat no-caps label="Cancel" class="cancel-btn" @click="cancelCreate" />

      <q-btn unelevated no-caps label="Create Event" class="create-btn" :loading="saving" @click="createEvent" />
    </div>

    <!-- =========================================================
         DATE DIALOG
    ========================================================== -->
    <q-dialog v-model="showDateDialog">
      <q-card class="date-dialog">
        <EventDialogHeader title="Select Schedule Dates" subtitle="Select one or multiple dates for this event." />

        <q-separator />

        <q-card-section class="date-dialog-body">
          <q-date v-model="selectedDates" multiple today-btn mask="YYYY-MM-DD" color="green" minimal
            class="full-width" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn unelevated no-caps label="Apply Dates" class="save-dialog-btn" @click="applyDates" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =========================================================
         DEPARTMENT DIALOG
    ========================================================== -->
    <q-dialog v-model="showDepartmentDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="department-dialog">
        <EventDialogHeader title="Add Departments &amp; Employees"
          subtitle="Select departments/employees and specify the number of attendees for each." />

        <q-separator />

        <!-- TABS: DEPARTMENT / EMPLOYEE -->
        <q-tabs v-model="dialogTab" dense class="tab-navigation" active-color="green" indicator-color="green"
          align="left" narrow-indicator>
          <q-tab name="department" label="Department" />
          <q-tab name="employee" label="Employee" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="dialogTab" animated class="department-dialog-body">

          <!-- ===================== DEPARTMENT PANEL ===================== -->
          <q-tab-panel name="department" class="dialog-tab-panel">
            <!-- Search Bar -->
            <q-input v-model="officeSearch" outlined dense clearable placeholder="Search departments..."
              class="office-search">
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- Quick Actions Row -->
            <div class="quick-actions-row">
              <div class="selection-actions">
                <q-btn flat dense no-caps label="Select All" class="select-all-btn" :disable="!filteredOffices.length"
                  @click="selectAllOffices" />
                <q-btn flat dense no-caps label="Clear All" class="clear-all-btn" :disable="!selectedOffices.length"
                  @click="clearAllOffices" />

                <div class="selected-badge" v-if="selectedOffices.length > 0">
                  <q-badge color="green" text-color="white" rounded>
                    {{ selectedOffices.length }} department{{
                      selectedOffices.length > 1 ? "s" : ""
                    }}
                    selected
                  </q-badge>
                </div>
              </div>

              <div class="bulk-attendee-wrapper">
                <q-input v-model.number="bulkAttendeeCount" type="number" min="0" outlined dense
                  placeholder="Set all to" class="bulk-input" style="width: 120px" />
                <q-btn flat no-caps color="green" label="Apply to All Selected" :disable="selectedOffices.length === 0 ||
                  bulkAttendeeCount === null ||
                  bulkAttendeeCount === ''
                  " @click="applyBulkAttendees" class="apply-bulk-btn" />
              </div>
            </div>

            <!-- Offices Table -->
            <div class="offices-table-container">
              <q-table :rows="filteredOffices" :columns="officeColumns" row-key="officeId"
                :loading="officeStore.loading" :rows-per-page-options="[5, 10, 25, 50]"
                v-model:pagination="officePagination" binary-state-sort selection="multiple"
                v-model:selected="selectedOffices" class="offices-table" flat bordered>
                <template #body-cell-office_name="props">
                  <q-td :props="props">
                    <div class="office-name-cell">{{ props.row.office_name }}</div>
                  </q-td>
                </template>

                <template #body-cell-attendees="props">
                  <q-td :props="props">
                    <q-input v-model.number="props.row._attendees" type="number" min="0" outlined dense placeholder="0"
                      class="attendee-input-cell" @update:model-value="updateAttendeeValue(props.row)">
                      <template #append>
                        <q-icon name="people" color="grey-6" size="18px" />
                      </template>
                    </q-input>
                  </q-td>
                </template>

                <template #loading>
                  <div class="loading-state">
                    <q-spinner-dots color="green" size="40px" />
                    <div>Loading departments...</div>
                  </div>
                </template>

                <template #no-data>
                  <div class="no-data-state">
                    <q-icon name="business" size="40px" color="grey-4" />
                    <div>No departments available</div>
                  </div>
                </template>
              </q-table>
            </div>
          </q-tab-panel>

          <!-- ===================== EMPLOYEE PANEL ===================== -->
          <q-tab-panel name="employee" class="dialog-tab-panel">
            <!-- OFFICE SELECTOR -->
            <q-select v-model="activeEmployeeOffice" outlined dense emit-value map-options
              :options="departmentOfficeOptions" :loading="eventStore.loading" label="Select Office"
              class="custom-input" @update:model-value="onOfficeChangeForEmployees" />

            <div v-if="!activeEmployeeOffice" class="empty-state">
              <q-icon name="info" size="28px" color="grey-4" />
              <div>Select an office above to view suggested employees.</div>
            </div>

            <template v-else>
              <!-- SEARCH BAR -->
              <q-input v-model="employeeSearch" outlined dense clearable placeholder="Search employees..."
                class="office-search employee-search-spacing">
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>

              <div class="quick-actions-row">
                <div class="selection-actions">
                  <q-btn flat dense no-caps label="Select All" class="select-all-btn"
                    :disable="!filteredSuggestedEmployees.length" @click="selectAllEmployeesForOffice" />
                  <q-btn flat dense no-caps label="Clear All" class="clear-all-btn"
                    :disable="!currentOfficeSelectedEmployees.length" @click="clearAllEmployeesForOffice" />

                  <div class="selected-badge" v-if="currentOfficeSelectedEmployees.length > 0">
                    <q-badge color="green" text-color="white" rounded>
                      {{ currentOfficeSelectedEmployees.length }} employee{{
                        currentOfficeSelectedEmployees.length > 1 ? "s" : ""
                      }} selected
                    </q-badge>
                  </div>
                </div>
              </div>

              <div class="offices-table-container">
                <q-table :rows="filteredSuggestedEmployees" :columns="employeeColumns" row-key="ControlNo"
                  :loading="eventStore.loading" :rows-per-page-options="[5, 10, 25, 50]"
                  v-model:pagination="employeeTablePagination" selection="multiple"
                  v-model:selected="currentOfficeSelectedEmployees" class="offices-table" flat bordered>
                  <template #body="props">
                    <q-tr :props="props" :class="{ 'trained-row': props.row.isAlreadyTrained }">
                      <q-td auto-width>
                        <q-checkbox v-model="props.selected" />
                      </q-td>

                      <q-td v-for="col in props.cols" :key="col.name" :props="props">
                        <template v-if="col.name === 'isAlreadyTrained'">
                          <q-badge :color="props.row.isAlreadyTrained ? 'red' : 'green'">
                            {{ props.row.isAlreadyTrained ? 'Yes' : 'No' }}
                          </q-badge>
                        </template>
                        <template v-else-if="col.name === 'Action'">
                          <q-btn flat dense round icon="visibility" color="primary"
                            @click="openEmployeeRecordDialog(props.row)">
                            <q-tooltip>View Records</q-tooltip>
                          </q-btn>
                        </template>
                        <template v-else>
                          {{ col.value }}
                        </template>
                      </q-td>
                    </q-tr>
                  </template>

                  <template #loading>
                    <div class="loading-state">
                      <q-spinner-dots color="green" size="40px" />
                      <div>Loading suggested employees...</div>
                    </div>
                  </template>

                  <template #no-data>
                    <div class="no-data-state">
                      <q-icon name="person" size="40px" color="grey-4" />
                      <div>No suggested employees found for this office.</div>
                    </div>
                  </template>
                </q-table>
              </div>
            </template>
          </q-tab-panel>

        </q-tab-panels>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn unelevated no-caps label="Add Selected" class="save-dialog-btn"
            :disable="selectedOffices.length === 0 && allSelectedEmployees.length === 0"
            @click="addSelectedDepartments" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =========================================================
     EMPLOYEE RECORD DIALOG (Civil Service + Training)
    ========================================================== -->
    <q-dialog v-model="showEmployeeRecordDialog">
      <q-card class="employee-record-dialog">
        <EventDialogHeader :title="selectedEmployeeRecord?.name || 'Employee Record'"
          :subtitle="selectedEmployeeRecord?.position || ''" />

        <q-separator />

        <q-card-section class="employee-record-body">
          <!-- CIVIL SERVICE SECTION -->
          <div class="record-section-title">Civil Service Eligibility</div>

          <div v-if="selectedEmployeeRecord?.x_civil_service?.length" class="record-table">
            <q-markup-table flat bordered dense>
              <thead>
                <tr>
                  <th class="text-left">Eligibility</th>
                  <th class="text-left">Date</th>
                  <th class="text-left">Rating</th>
                  <th class="text-left">Place</th>
                  <th class="text-left">License No.</th>
                  <th class="text-left">License Expiry</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cs, index) in selectedEmployeeRecord.x_civil_service" :key="index">
                  <td>{{ cs.CivilServe }}</td>
                  <td>{{ cs.Dates }}</td>
                  <td>{{ cs.Rates }}</td>
                  <td>{{ cs.Place }}</td>
                  <td>{{ cs.LNumber || '—' }}</td>
                  <td>{{ cs.LDate || '—' }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
          <div v-else class="record-empty">
            No civil service records found.
          </div>

          <!-- TRAINING SECTION -->
          <div class="record-section-title training-title">Training Attended</div>

          <div v-if="selectedEmployeeRecord?.x_training?.length" class="record-table">
            <q-markup-table flat bordered dense>
              <thead>
                <tr>
                  <th class="text-left">Training</th>
                  <th class="text-left">Hours</th>
                  <th class="text-left">Conductor</th>
                  <th class="text-left">Date From</th>
                  <th class="text-left">Date To</th>
                  <th class="text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tr, index) in selectedEmployeeRecord.x_training" :key="index">
                  <td>{{ tr.training }}</td>
                  <td>{{ tr.NumHours }}</td>
                  <td>{{ tr.Conductor }}</td>
                  <td>{{ tr.DateFrom }}</td>
                  <td>{{ tr.DateTo }}</td>
                  <td>{{ tr.Type }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
          <div v-else class="record-empty">
            No trainings attended yet.
          </div>

          <div class="record-section-title training-title">Recent Training</div>

          <div v-if="selectedEmployeeRecord?.previous_training" class="record-table">
            <q-markup-table flat bordered dense>
              <thead>
                <tr>
                  <th class="text-left">Training</th>
                  <th class="text-left">Hours</th>
                  <th class="text-left">Conductor</th>
                  <th class="text-left">Date From</th>
                  <th class="text-left">Date To</th>
                  <th class="text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ selectedEmployeeRecord.previous_training.training }}</td>
                  <td>{{ selectedEmployeeRecord.previous_training.NumHours }}</td>
                  <td>{{ selectedEmployeeRecord.previous_training.Conductor }}</td>
                  <td>{{ selectedEmployeeRecord.previous_training.DateFrom }}</td>
                  <td>{{ selectedEmployeeRecord.previous_training.DateTo }}</td>
                  <td>{{ selectedEmployeeRecord.previous_training.Type }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
          <div v-else class="record-empty">
            No recent training found.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <!-- =========================================================
     DEPARTMENT EMPLOYEES VIEW DIALOG
    ========================================================== -->
    <q-dialog v-model="showDepartmentEmployeesDialog">
      <q-card class="department-employees-dialog">
        <EventDialogHeader :title="viewingDepartment?.name || 'Selected Employees'"
          :subtitle="`${viewingDepartment?.employees?.length || 0} employee(s) selected`" />

        <q-separator />

        <q-card-section class="department-employees-body">
          <div v-if="viewingDepartment?.employees?.length" class="employees-list">
            <div v-for="emp in viewingDepartment.employees" :key="emp.control_no" class="employee-list-item">
              <q-icon name="person" size="18px" color="grey-6" />
              <div class="employee-list-info">
                <div class="employee-list-name">{{ emp.name }}</div>
                <div v-if="emp.position" class="employee-list-position">{{ emp.position }}</div>
                <div v-if="emp.status" class="employee-list-position">{{ emp.status }}</div>
              </div>
            </div>
          </div>

          <div v-else class="record-empty">
            No employees selected for this department.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- SALARY GRADE DIALOG -->
    <q-dialog v-model="showSgDialog">
      <q-card class="sg-dialog">
        <EventDialogHeader title="Set Salary Grade" subtitle="Set the SG range allowed for this event (1 to 33)." />

        <q-separator />

        <q-card-section class="sg-dialog-body">
          <div class="sg-range">
            <q-input v-model.number="sgDraft.from" type="number" outlined dense min="0" max="50" label="From"
              class="sg-input" />
            <span class="sg-separator"> - </span>
            <q-input v-model.number="sgDraft.to" type="number" outlined dense min="0" max="50" label="To"
              class="sg-input" />
          </div>

          <div v-if="sgError" class="sg-error">{{ sgError }}</div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Clear" color="red" @click="clearSgFromDialog" />
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn unelevated no-caps label="Apply" class="save-dialog-btn" @click="applySg" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =========================================================
         ASSESSMENT DIALOG (left: setup, right: preview)
    ========================================================== -->
    <q-dialog v-model="showAssessmentDialog">
      <q-card class="assessment-dialog">
        <EventDialogHeader title="Create Assessment"
          subtitle="Set up the Pre Test and Post Test. Click a test to preview it on the right." />

        <q-separator />

        <q-card-section class="assessment-dialog-body">
          <div class="assessment-modal-grid">
            <!-- ================= LEFT: SETUP ================= -->
            <div class="assessment-modal-left">
              <!-- <div class="arms-card" :class="eventForm.is_assessment_open ? 'arms-card--on' : 'arms-card--off'">
                <div class="arms-card-info">
                  <q-icon :name="eventForm.is_assessment_open ? 'lock_open' : 'lock'"
                    :color="eventForm.is_assessment_open ? 'green-7' : 'red-7'" size="20px" class="arms-card-icon" />
                  <div class="arms-card-desc">
                    {{ eventForm.is_assessment_open
                      ? 'The assessment is open. Employees can now answer the tests.'
                      : 'The assessment is closed. Turn this on to make it available to employees.' }}
                  </div>
                </div>
                <q-toggle v-model="eventForm.is_assessment_open" :color="eventForm.is_assessment_open ? 'green' : 'red'"
                  keep-color />
              </div> -->

              <div v-for="test in assessmentTests" :key="test.key" class="test-card test-card--clickable"
                :class="{ 'test-card--active': previewTest && previewTest.key === test.key }"
                @click="previewTestKey = test.key">
           <div class="test-card-header">
              <div class="test-card-title">{{ test.label }}</div>

              <div class="row items-center q-gutter-xs">
                <q-btn v-if="canCopyFromPre(test)" flat no-caps dense icon="content_copy"
                  label="Copy from Pre-Test" class="copy-pre-btn" @click.stop="copyFromPreTest(test)" />

                <q-btn outline no-caps dense :icon="eventForm[test.formKey] ? 'edit' : 'add'"
                  :label="eventForm[test.formKey] ? 'Edit Form' : 'Create Form'" class="create-assessment-btn"
                  @click.stop="openFormBuilder(test.key)" />
              </div>
            </div>

                <div v-if="eventForm[test.formKey]" class="test-form-summary">
                  <q-icon name="description" size="18px" color="green-7" />
                  <div class="test-form-summary-text">
                    <div class="test-form-summary-title">{{ eventForm[test.formKey].title }}</div>
                    <div class="test-form-summary-meta">
                      {{ eventForm[test.formKey].questions.length }} question(s)
                    </div>
                  </div>
                  <q-btn flat round dense icon="delete_outline" class="delete-btn" @click.stop="removeTestForm(test)">
                    <q-tooltip>Remove Form</q-tooltip>
                  </q-btn>
                </div>

             <LabeledField label="Passing Score">
            <q-input :model-value="getPassingScore(test)" type="number" min="0" outlined dense
              :disable="!eventForm[test.formKey]" placeholder="eg. 20" class="custom-input" @click.stop
              @update:model-value="setPassingScore(test, $event)" />
          </LabeledField>
              </div>

              <div v-if="assessmentCount < MAX_ASSESSMENTS" class="add-more-assessment">
                <q-btn outline no-caps icon="add" :label="`Add Assessment ${assessmentCount + 1}`"
                  class="create-assessment-btn" @click="addAssessment" />
              </div>
              <div v-else-if="assessmentCount > 1" class="add-more-assessment">
                <q-btn flat no-caps dense icon="close" label="Remove Last Assessment" class="remove-assessment-btn"
                  @click="removeAssessment" />
              </div>
            </div>

            <!-- ================= RIGHT: PREVIEW ================= -->
            <div class="assessment-modal-right">
              <div class="preview-label">Preview</div>

              <div class="preview-card">
          <div class="preview-event">{{ previewTest ? previewTest.label : '' }}</div>
            <div class="preview-test">{{ eventForm.title_name || 'Untitled Event' }}</div>

                <q-separator class="preview-separator" />

                <template v-if="previewForm">
                  <!-- <div class="preview-form-title">{{ previewForm.title }}</div>
                  <div v-if="previewForm.description" class="preview-form-desc">{{ previewForm.description }}</div> -->

                  <div v-for="(q, qi) in previewForm.questions" :key="qi" class="preview-question">
                    <div class="preview-question-text">{{ qi + 1 }}. {{ questionText(q) }}</div>
                    <ul v-if="questionOptions(q).length" class="preview-options">
                      <li v-for="(opt, oi) in questionOptions(q)" :key="oi">{{ opt }}</li>
                    </ul>
                    <div v-else class="preview-answer-line">Short answer</div>
                  </div>
                </template>

                <div v-else-if="previewTest && eventForm[previewTest.linkKey]" class="preview-empty">
                  <q-icon name="link" size="28px" />
                  <span>Using Google Form link:</span>
                  <span class="preview-link">{{ eventForm[previewTest.linkKey] }}</span>
                </div>

                <div v-else class="preview-empty">
                  <q-icon name="description" size="28px" />
                  <span>No form yet. Click "Create Form" to build the {{ previewTest ? previewTest.label : 'test'
                    }}.</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn unelevated no-caps label="Done" class="save-dialog-btn" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- GOOGLE FORM BUILDER (Pre Test / Post Test) -->
<GoogleFormBuilderDialog v-model="showGoogleFormDialog" :event-title="eventForm.title_name || ''"
  :test-label="builderLabel" :initial-form="builderInitialForm" @save="onSaveGoogleForm" />
  </q-page>
</template>

<script>
import { defineComponent, computed, ref, onMounted, watch, } from "vue";
import { useRouter } from "vue-router";
import { useEventStore } from "stores/eventStore";
import { useOfficeStore } from "stores/officeStore";
import { Notify } from "quasar";

import EventPageHeader from "components/events/EventPageHeader.vue";
import EventTwoColumnLayout from "components/events/EventTwoColumnLayout.vue";
import EventDialogHeader from "components/events/EventDialogHeader.vue";
import LabeledField from "components/events/LabeledField.vue";
import GoogleFormBuilderDialog from "components/events/GoogleFormBuilderDialog.vue";
import { useAssessmentStore } from "src/stores/event/assessmentStore";

import { useModeStore } from "src/stores/library/event/modeStore";
import { useTitleStore } from "src/stores/library/event/titleStore";
import { useVenueStore } from "src/stores/library/event/venueStore";
import { useCategoryStore } from "src/stores/library/event/categoryStore";
import { useTypeStore } from "src/stores/library/event/typeStore";
import { coreOptions, technicalOptions, leadershipOptions } from "src/constants/competency";
import { sourceOptions } from "src/constants/source";
import { buildCompetenciesPayload, buildFormsPayload } from "src/composables/event/useCreateEventPayload";
import { formsOptions, evaluationOptions } from "src/constants/form";

import Swal from "sweetalert2";


export default defineComponent({
  name: "CreateEventPage",

  components: {
    EventPageHeader,
    EventTwoColumnLayout,
    EventDialogHeader,
    LabeledField,
    GoogleFormBuilderDialog,
  },

  setup() {

    // title
    const titleStore = useTitleStore();
    const titleOptions = ref([])
    const titleLoading = ref(false)


    // venue
    const venueStore = useVenueStore();
    const venueOptions = ref([])
    const venueLoading = ref(false)

    // mode
    const modeStore = useModeStore();
    const modeOptions = ref([])
    const modeLoading = ref(false)

    // category
    const categoryStore = useCategoryStore();
    const categoryOptions = ref([])
    const categoryLoading = ref(false)

    const typeStore = useTypeStore();
    const typeOptions = ref([])
    const typeLoading = ref(false)
    // event component  end


    const router = useRouter();

    const officeStore = useOfficeStore();
    const assessmentStore = useAssessmentStore();

    const eventForm = ref({
      title_name: "",
      category_name: null,
      source_name: null,
      sync_to_arms: false,
      intervention_name: "Formal Learning",
      type_name: null,
      venue_name: "",
      mode_name: null,
      competencies: [],
      hours: null,
      conducted_by: null,
      // NOTE: speakers are now stored per schedule (schedule.speakers)
      schedules: [],
      departments: [],
      employees: [],
      forms: [],
      evaluations: [],
      is_assessment_open: false,
      form_open_date: null,
      form_due_date: null,
      sg_from: null,
      sg_to: null,
    });

    // =========================================================
    // LOADING
    // =========================================================
    const saving = ref(false);
    const activeTab = ref("schedule");


    //suggested employee
    const showEmployeeRecordDialog = ref(false);
    const selectedEmployeeRecord = ref(null);

    function openEmployeeRecordDialog(employee) {
      selectedEmployeeRecord.value = employee;
      showEmployeeRecordDialog.value = true;
    }
    const eventStore = useEventStore();
    const activeEmployeeOffice = ref(null);
    const dialogTab = ref("department");

    const employeeTablePagination = ref({
      sortBy: "employee_name",
      descending: false,
      rowsPerPage: 10,
      page: 1,
    });

    const employeeSearch = ref("");

    const filteredSuggestedEmployees = computed(() => {
      const search = employeeSearch.value?.toLowerCase().trim();
      if (!search) return eventStore.employees;

      return eventStore.employees.filter((emp) =>
        emp.name?.toLowerCase().includes(search) ||
        emp.position?.toLowerCase().includes(search)
      );
    });
    const employeeColumns = [
      {
        name: "name",
        required: true,
        label: "Employee",
        field: "name",
        align: "left",
        sortable: true,
        style: "min-width: 220px;",
      },
      {
        name: "position",
        label: "Position",
        field: "position",
        align: "left",
        sortable: true,
        style: "min-width: 200px;",
      },
      {
        name: "status",
        label: "Status",
        field: "status",
        align: "center",
        sortable: true,
        style: "min-width: 100px;",
      },
      {
        name: "trainingCount",
        label: "Trainings Attended",
        field: "trainingCount",
        align: "center",
        sortable: true,
        style: "min-width: 90px;",
      },
      {
        name: "isAlreadyTrained",
        label: "Trained?",
        field: "isAlreadyTrained",
        align: "center",
        sortable: true,
        style: "min-width: 90px;",
      },
      {
        name: "recentTrainingDate",
        label: "Recent training date",
        field: (row) => row.previous_training?.Date ?? null,
        format: (val) => val || "—",
        align: "center",
        sortable: true,
        style: "min-width: 140px;",
      },
      {
        name: "Action",
        label: "Action",
        field: "action",
        align: "center",
        sortable: true,
        style: "min-width: 90px;",
      },
    ];
    // options galing sa offices na na-add na sa Department tab
    const departmentOfficeOptions = computed(() =>
      selectedOffices.value.map((office) => ({
        label: office.office_name,
        value: office.office_name,
      }))
    );

    // per-office na "basket" ng napiling employees
    const selectedEmployeesByOffice = ref({});
    const allSelectedEmployees = computed(() => {
      return Object.values(selectedEmployeesByOffice.value).flat();
    });

    const currentOfficeSelectedEmployees = computed({
      get() {
        if (!activeEmployeeOffice.value) return [];
        return selectedEmployeesByOffice.value[activeEmployeeOffice.value] || [];
      },
      set(val) {
        if (!activeEmployeeOffice.value) return;
        selectedEmployeesByOffice.value[activeEmployeeOffice.value] = val;
      },
    });

    function selectAllEmployeesForOffice() {
      currentOfficeSelectedEmployees.value = [...filteredSuggestedEmployees.value];
    }

    function clearAllEmployeesForOffice() {
      currentOfficeSelectedEmployees.value = [];
    }
    async function onOfficeChangeForEmployees(officeName) {
      employeeSearch.value = ""; // reset search
      if (!officeName) return;
      if (!selectedEmployeesByOffice.value[officeName]) {
        selectedEmployeesByOffice.value[officeName] = [];
      }
      await eventStore.fetchSuggested(officeName, eventForm.value.title_name);
    }


    // =========================================================
    // OPTIONS
    // =========================================================


    const frequencyOptions = [
      { label: "One-time", value: "One-time" },
      { label: "Weekly", value: "Weekly" },
      { label: "Monthly", value: "Monthly" },
      { label: "Ongoing", value: "Ongoing" },
    ];

    // =========================================================
    // L&D INTERVENTION HIERARCHY
    // Intervention (top level) -> Type (sub-options)
    // =========================================================
    const interventionOptions = [
      { label: "Formal Learning", value: "Formal Learning" },
      { label: "Experiential Learning", value: "Experiential Learning" },
      { label: "Social Learning", value: "Social Learning" },
      // { label: "Self-Directed Learning", value: "Self-Directed Learning" },
    ];

    function resetInterventionForm() {
      eventForm.value.interventionForm = {
        example: "",
        output: "",
        supervisor: "",
        learning_partner: "",
        topic: "",
        frequency: null,
        resource: "",
        proof: "",
        objective: "",
      };
    }

    // Reset Type + the intervention-specific form whenever the
    // Intervention category changes, so stale data from a previously
    // selected category never leaks into a different one.
    watch(
      () => eventForm.value.intervention_name,
      () => {
        eventForm.value.type_name = null;
        resetInterventionForm();
      }
    );

    // =========================================================
    // DEPARTMENT TABLE (MAIN)
    // =========================================================
    const departmentSearch = ref("");
    const departmentPagination = ref({
      sortBy: "name",
      descending: false,
      rowsPerPage: 4,
      page: 1,
    });

    const departmentColumns = [
      {
        name: "name",
        label: "Department",
        field: "name",
        align: "left",
        sortable: true,
        style: "min-width: 200px;",
      },
      {
        name: "attendees",
        label: "No. of Attendees",
        field: "attendees",
        align: "center",
        sortable: true,
        style: "min-width: 120px;",
      },
      {
        name: "action",
        label: "Action",
        field: "action",
        align: "center",
        sortable: false,
        style: "width: 60px;",
      },
    ];

    const filteredDepartments = computed(() => {
      const search = departmentSearch.value?.toLowerCase().trim();

      if (!search) {
        return eventForm.value.departments;
      }

      return eventForm.value.departments.filter((department) =>
        department.name.toLowerCase().includes(search)
      );
    });

    // =========================================================
    // OFFICE TABLE (DIALOG)
    // =========================================================
    const officeSearch = ref("");
    const selectedOffices = ref([]);
    const bulkAttendeeCount = ref(null);
    const officePagination = ref({
      sortBy: "office_name",
      descending: false,
      rowsPerPage: 9,
      page: 1,
    });

    const officeColumns = [
      {
        name: "office_name",
        required: true,
        label: "Department / Office",
        field: "office_name",
        align: "left",
        sortable: true,
        style: "min-width: 280px;",
      },
      {
        name: "attendees",
        label: "No. of Attendee/s",
        field: "attendees",
        align: "center",
        sortable: false,
        style: "min-width: 160px;",
      },
    ];

    // Initialize selected offices with _attendees property
    const initializeSelectedOffices = (offices) => {
      return offices.map((office) => ({
        ...office,
        _attendees: office._attendees || 0,
      }));
    };

    const filteredOffices = computed(() => {
      const offices = officeStore.offices.map((office) => {
        // Check if this office is already in selectedOffices
        const existing = selectedOffices.value.find(
          (o) => o.officeId === office.officeId
        );
        return {
          ...office,
          _attendees: existing?._attendees ?? 0,
        };
      });

      if (!officeSearch.value) return offices;

      const search = officeSearch.value.toLowerCase().trim();
      return offices.filter((office) =>
        office.office_name.toLowerCase().includes(search)
      );
    });

    // Watch selectedOffices to ensure _attendees is always a number
    watch(selectedOffices, (newVal) => {
      const stillExists = newVal.some(
        (o) => o.office_name === activeEmployeeOffice.value
      );
      if (activeEmployeeOffice.value && !stillExists) {
        activeEmployeeOffice.value = null;
      }
    });

    // =========================================================
    // SELECT ALL / CLEAR ALL (OFFICE DIALOG)
    // =========================================================
    function selectAllOffices() {
      // Merge currently filtered offices into selection, preserving
      // any _attendees value already set.
      const merged = filteredOffices.value.map((office) => {
        const existing = selectedOffices.value.find(
          (o) => o.officeId === office.officeId
        );
        return {
          ...office,
          _attendees: existing?._attendees ?? office._attendees ?? 0,
        };
      });

      // Keep any previously selected offices that fall outside the
      // current filter/search results.
      const outsideFilter = selectedOffices.value.filter(
        (selected) =>
          !filteredOffices.value.some(
            (office) => office.officeId === selected.officeId
          )
      );

      selectedOffices.value = initializeSelectedOffices([
        ...outsideFilter,
        ...merged,
      ]);
    }

    function clearAllOffices() {
      selectedOffices.value = [];
    }

    // =========================================================
    // ATTENDEE TOTAL
    // =========================================================
    const totalAttendees = computed(() => {
      return eventForm.value.departments.reduce((total, department) => {
        return total + Number(department.attendees || 0);
      }, 0);
    });

    // =========================================================
    // SPEAKERS (per schedule date)
    // =========================================================
    function createSpeaker() {
      return { id: Date.now() + Math.random(), name: "", agency: "", position: "" };
    }

    function addScheduleSpeaker(schedule) {
      schedule.speakers.push(createSpeaker());
    }

    function removeScheduleSpeaker(schedule, index) {
      schedule.speakers.splice(index, 1);
    }

    // Kopyahin yung speakers ng isang date sa lahat ng ibang dates
    function copySpeakersToAll(sourceIndex) {
      const source = eventForm.value.schedules[sourceIndex].speakers;
      eventForm.value.schedules.forEach((s, i) => {
        if (i === sourceIndex) return;
        s.speakers = source.map((sp) => ({ ...sp, id: Date.now() + Math.random() }));
      });
    }

    // =========================================================
    // DATE DIALOG
    // =========================================================
    const showDateDialog = ref(false);
    const selectedDates = ref([]);

    function openDateDialog() {
      selectedDates.value = eventForm.value.schedules.map(
        (schedule) => schedule.rawDate
      );
      showDateDialog.value = true;
    }

    function formatDate(date) {
      if (!date) return "";

      const [year, month, day] = date.split("-");
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));

      return parsed.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    function applyDates() {
      const oldSchedules = eventForm.value.schedules;

      eventForm.value.schedules = selectedDates.value.map((date) => {
        const existing = oldSchedules.find((schedule) => schedule.rawDate === date);

        return {
          id: existing?.id || Date.now() + Math.random(),
          rawDate: date,
          date: formatDate(date),
          // Leave times blank by default. Morning or afternoon can be entered independently.
          morning_in: existing ? existing.morning_in : "08:00",
          morning_out: existing ? existing.morning_out : "12:00",
          afternoon_in: existing ? existing.afternoon_in : "13:00",
          afternoon_out: existing ? existing.afternoon_out : "17:00",
          // Speakers are kept per date so they don't disappear on re-apply
          speakers: existing?.speakers?.length ? existing.speakers : [createSpeaker()],
        };
      });

      applyDefaultFormTimes();
      showDateDialog.value = false;
    }

    function removeSchedule(index) {
      eventForm.value.schedules.splice(index, 1);
      applyDefaultFormTimes();
    }

    // =========================================================
    // DATE RANGE
    // =========================================================
    const selectedDateRange = computed(() => {
      const schedules = eventForm.value.schedules;

      if (!schedules.length) return "";

      const dates = schedules.map((schedule) => schedule.rawDate).sort();

      if (dates.length === 1) {
        return formatDate(dates[0]);
      }

      return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
    });

    // =========================================================
    // SCHEDULE HOURS (excludes 12:00–1:00 lunch break)
    // Times are always stored as valid "HH:mm" 24-hour strings
    // (set via q-time), so parsing here can't fail.
    // =========================================================
    function parseTimeToMinutes(timeStr) {
      if (!timeStr) return null;

      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return null;

      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);

      if (hours > 23 || minutes > 59) return null;

      return hours * 60 + minutes;
    }


    function formatTimeDisplay(timeStr) {
      const totalMinutes = parseTimeToMinutes(timeStr);
      if (totalMinutes === null) return "";

      let hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const period = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;
      if (hours === 0) hours = 12;

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
    }

    function formatTimeForPayload(timeStr) {
      // API expects h:i A, so a blank time is sent as midnight in that format.
      return timeStr ? formatTimeDisplay(timeStr) || "12:00 AM" : "12:00 AM";
    }
    function computeScheduleMinutes(schedule) {
      const start = parseTimeToMinutes(schedule.time_start);
      const end = parseTimeToMinutes(schedule.time_end);

      if (start === null || end === null || end <= start) return 0;

      let totalMinutes = end - start;

      // Lunch break: 12:00 pm (720) - 1:00 pm (780)
      const lunchStart = 12 * 60;
      const lunchEnd = 13 * 60;

      const overlapStart = Math.max(start, lunchStart);
      const overlapEnd = Math.min(end, lunchEnd);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      totalMinutes -= overlap;

      return Math.max(0, totalMinutes);
    }

    function formatHours(minutes) {
      const hours = minutes / 60;
      const rounded = Math.round(hours * 10) / 10;
      return Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
    }

    function getScheduleHours(schedule) {
      return formatHours(computeScheduleMinutes(schedule));
    }


    // =========================================================
    // DEPARTMENT DIALOG
    // =========================================================
    const showDepartmentDialog = ref(false);

    function openDepartmentDialog() {
      if (!eventForm.value.title_name) {
        Notify.create({
          type: "warning",
          message: "Please enter an event title first.",
          position: "top",
        });
        return;
      }
      officeSearch.value = "";
      bulkAttendeeCount.value = null;

      // Pre-select offices that are already added
      const existingOfficeIds = eventForm.value.departments.map((d) => d.id);
      const preselectedOffices = officeStore.offices
        .filter((office) => existingOfficeIds.includes(office.officeId))
        .map((office) => {
          const existingDept = eventForm.value.departments.find(
            (d) => d.id === office.officeId
          );
          return {
            ...office,
            _attendees: existingDept?.attendees || 0,
          };
        });

      selectedOffices.value = initializeSelectedOffices(preselectedOffices);
      showDepartmentDialog.value = true;
    }

    // Update attendee value and ensure it persists
    function updateAttendeeValue(row) {
      const index = selectedOffices.value.findIndex(
        (o) => o.officeId === row.officeId
      );
      if (index !== -1) {
        const value = Number(row._attendees);
        selectedOffices.value[index]._attendees = isNaN(value) ? 0 : value;
      }
    }

    function applyBulkAttendees() {
      if (
        selectedOffices.value.length === 0 ||
        bulkAttendeeCount.value === null
      ) {
        return;
      }

      const count = Number(bulkAttendeeCount.value);
      selectedOffices.value.forEach((office) => {
        office._attendees = isNaN(count) ? 0 : count;
      });

      Notify.create({
        type: "positive",
        message: `Applied ${count} attendee${count > 1 ? "s" : ""} to ${selectedOffices.value.length
          } department(s).`,
        position: "top",
        timeout: 1500,
      });
    }


    const showDepartmentEmployeesDialog = ref(false);
    const viewingDepartment = ref(null);

    function openDepartmentEmployeesDialog(department) {
      viewingDepartment.value = department;
      showDepartmentEmployeesDialog.value = true;
    }
    function addSelectedDepartments() {
      eventForm.value.departments = selectedOffices.value.map((office) => ({
        id: office.officeId,
        name: office.office_name,
        attendees: Number(office._attendees) || 0,
        employees: (selectedEmployeesByOffice.value[office.office_name] || []).map((emp) => ({
          control_no: emp.ControlNo,
          name: emp.name,
          position: emp.position,
          status: emp.status,
        })),
      }));

      // Flat list ng LAHAT ng napiling employees (across all offices) — ito ang gagamitin sa payload
      eventForm.value.employees = Object.entries(selectedEmployeesByOffice.value)
        .flatMap(([officeName, employees]) =>
          employees.map((emp) => ({
            control_no: emp.ControlNo,
            name: emp.name,
            position: emp.position,
            office: emp.office,
            status: emp.status,
          }))
        );

      showDepartmentDialog.value = false;

      if (selectedOffices.value.length > 0) {
        Notify.create({
          type: "positive",
          message: `${selectedOffices.value.length} department(s) added successfully.`,
          position: "top",
          timeout: 2000,
        });
      }
    }

    function removeDepartment(index) {
      eventForm.value.departments.splice(index, 1);
    }

    // =========================================================
    // LOAD OFFICES
    // =========================================================
    onMounted(async () => {
      try {
        await officeStore.fetchOffices();
      } catch (error) {
        console.error("Failed to load offices:", error);
        Notify.create({
          type: "negative",
          message: "Failed to load departments. Please refresh the page.",
          position: "top",
        });
      }
    });

    // =========================================================
    // GO BACK
    // =========================================================
    function goBack() {
      if (window.history.state?.back || document.referrer) {
        router.back();
      } else {
        router.push({ name: "events" });
      }
    }

    // =========================================================
    // CANCEL
    // =========================================================
    function cancelCreate() {
      router.back();
    }



    // =========================================================
    // CREATE EVENT
    // =========================================================
    async function createEvent() {
      // Validation
      if (!eventForm.value.title_name) {
        Notify.create({
          type: "warning",
          message: "Please enter an event title.",
          position: "top",
        });
        return;
      }

      if (!eventForm.value.intervention_name) {
        Notify.create({
          type: "warning",
          message: "Please select an intervention.",
          position: "top",
        });
        return;
      }

      if (!eventForm.value.type_name) {
        Notify.create({
          type: "warning",
          message: "Please select a type.",
          position: "top",
        });
        return;
      }

      if (!eventForm.value.source_name) {
        Notify.create({
          type: "warning",
          message: "Please select at least one source.",
          position: "top",
        });
        return;
      }

      if (
        eventForm.value.intervention_name === "Formal Learning" &&
        !eventForm.value.schedules.length
      ) {
        Notify.create({
          type: "warning",
          message: "Please add at least one schedule date.",
          position: "top",
        });
        return;
      }
      for (const s of eventForm.value.schedules) {
        const mIn = parseTimeToMinutes(s.morning_in);
        const aIn = parseTimeToMinutes(s.afternoon_in);

        if (mIn !== null && mIn >= 12 * 60) {
          Notify.create({
            type: "warning",
            message: `Morning In on ${s.date} must be an AM time.`,
            position: "top",
          });
          return;
        }

        if (aIn !== null && aIn < 12 * 60) {
          Notify.create({
            type: "warning",
            message: `Afternoon In on ${s.date} must be a PM time.`,
            position: "top",
          });
          return;
        }
      }

   const assessment = assessmentTests.value
  .map((test) => ({ test, form: eventForm.value[test.formKey] }))
  .filter(({ form }) => form)
  .map(({ test, form }) => ({
    type: test.key.startsWith("pre") ? "pre_test" : "post_test",
    title: `${eventForm.value.title_name} - ${test.label.trim()}`,
    passing_score: form.passing_score,
    questions: form.questions,
  }));

      // Build payload according to API expectations
      const payload = {
        title_name: eventForm.value.title_name,
        category_name: eventForm.value.category_name,
        learning_intervention: eventForm.value.intervention_name,
        type_name: eventForm.value.type_name,
        conducted_by: eventForm.value.conducted_by,
        source_name: eventForm.value.source_name,
        qualifications: eventForm.value.qualifications || null,
        hours: eventForm.value.hours,
        venue_name: eventForm.value.venue_name,
        mode_name: eventForm.value.mode_name,
        fee: eventForm.value.fee,
        sync_to_arms: eventForm.value.sync_to_arms,

        employee: eventForm.value.employees,
        sg_from: eventForm.value.sg_from || null,
        sg_to: eventForm.value.sg_to || null,

        office: eventForm.value.departments.map((department) => ({
          office_name: department.name,
          number_of_attendees: department.attendees,
        })),

        DateTime: eventForm.value.schedules.map((schedule) => ({
          schedule_date: schedule.rawDate,
          morning_in: formatTimeDisplay(schedule.morning_in),
          morning_out: formatTimeDisplay(schedule.morning_out),
          afternoon_in: formatTimeDisplay(schedule.afternoon_in),
          afternoon_out: formatTimeDisplay(schedule.afternoon_out),
          speakers: (schedule.speakers || [])
            .filter((sp) => sp.name.trim())
            .map((sp) => ({
              speaker_name: sp.name,
              position: sp.position,
              agency: sp.agency,
            })),
        })),

        ...buildFormsPayload(eventForm.value.forms, eventForm.value.evaluations),
        ...buildCompetenciesPayload(eventForm.value.competencies), // ← spread, hindi nested key



        form_open_date: formatFormDate(eventForm.value.form_open_date) || null,
        form_due_date: formatFormDate(eventForm.value.form_due_date) || null,

        is_assessment_open: eventForm.value.is_assessment_open,
        assessment,
      };

      eventStore.clearError();
      saving.value = true;
      let eventCreated = false;

      try {
        const result = await eventStore.createEvent(payload);

        if (!result.success) {
          throw new Error(result.message || "Unable to create event.");
        }
        eventCreated = true;

        Notify.create({
          type: "positive",
          message: result.message || "Event created successfully.",
          position: "top",
        });

        router.back();
      } catch (error) {
        console.error(error);
        Notify.create({
          type: eventCreated ? "warning" : "negative",
          message: eventCreated
            ? `Event was created, but assessment saving failed: ${error?.message || "Please contact support."}`
            : error?.message || "Unable to create event.",
          position: "top",
          timeout: eventCreated ? 8000 : 5000,
        });
        if (eventCreated) router.back();
      } finally {
        saving.value = false;
      }
    }

    // title
    function onTitleInput(val) {
      eventForm.value.title_name = val;
    }

    async function filterTitles(val, update, abort) {
      titleLoading.value = true;
      try {
        await titleStore.fetchTitles(val);
        update(() => {
          titleOptions.value = titleStore.Titles.map((t) => t.title_name);
        });
      } catch (err) {
        abort();
        console.error(err);
      } finally {
        titleLoading.value = false;
      }
    }

    // venue
    function onVenuesInput(val) {
      eventForm.value.venue_name = val;
    }

    async function filterVenues(val, update, abort) {
      venueLoading.value = true;
      try {
        await venueStore.fetchVenues(val);
        update(() => {
          venueOptions.value = venueStore.Venues.map((v) => v.venue_name);
        });
      } catch (err) {
        abort();
        console.error(err);
      } finally {
        venueLoading.value = false;
      }
    }

    // mode
    function onModesInput(val) {
      eventForm.value.mode_name = val;
    }

    async function filterModes(val, update, abort) {
      modeLoading.value = true;
      try {
        await modeStore.fetchModes(val);
        update(() => {
          modeOptions.value = modeStore.modes.map((m) => m.mode_name);
        });
      } catch (err) {
        abort();
        console.error(err);
      } finally {
        modeLoading.value = false;
      }
    }

    // category
    function onCategoryInput(val) {
      eventForm.value.category_name = val;
    }

    async function filterCategory(val, update, abort) {
      categoryLoading.value = true;
      try {
        await categoryStore.fetchCategorys(val);
        update(() => {
          categoryOptions.value = categoryStore.Categorys.map((c) => c.category_name);
        });
      } catch (err) {
        abort();
        console.error(err);
      } finally {
        categoryLoading.value = false;
      }
    }



    // type
    function onTypeInput(val) {
      eventForm.value.type_name = val;
    }

    async function filterType(val, update, abort) {
      typeLoading.value = true;
      try {
        await typeStore.fetchTypes(val);
        update(() => {
          typeOptions.value = typeStore.Types.map((ty) => ty.type_name);
        });
      } catch (err) {
        abort();
        console.error(err);
      } finally {
        typeLoading.value = false;
      }
    }

    // =========================================================
    // ARMS AUTO-ENABLE (Source = In-house / internal)
    // =========================================================
    let armsAutoEnabled = false; // para malaman kung system ang nag-on, hindi ang user



    // AM only: 00:00 - 11:59
    function amOnly(hr) {
      return hr < 12;
    }

    // PM only: 12:00 - 23:59
    function pmOnly(hr) {
      return hr >= 12;
    }

    // =========================================================
    // FORM OPEN / DUE DEFAULTS
    // open = last schedule date 5:00 PM, due = last date + 3 days 11:59 PM
    // =========================================================
    const FORM_OPEN_HOUR = "17:00";
    const FORM_DUE_HOUR = "23:59";
    const FORM_DUE_DAYS_AFTER = 3;

    // para malaman kung ang laman ng field ay galing sa system (hindi manual na binago ng user)
    let lastAutoOpen = null;
    let lastAutoDue = null;

    function addDays(dateStr, days) {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d + days);
      const pad = (n) => String(n).padStart(2, "0");
      return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    }

    function applyDefaultFormTimes() {
      const form = eventForm.value;
      const dates = form.schedules.map((s) => s.rawDate).filter(Boolean).sort();

      if (!dates.length) {
        if (form.form_open_date === lastAutoOpen) form.form_open_date = null;
        if (form.form_due_date === lastAutoDue) form.form_due_date = null;
        lastAutoOpen = null;
        lastAutoDue = null;
        return;
      }

      const lastDate = dates[dates.length - 1];
      const newOpen = `${lastDate} ${FORM_OPEN_HOUR}`;
      const newDue = `${addDays(lastDate, FORM_DUE_DAYS_AFTER)} ${FORM_DUE_HOUR}`;

      if (!form.form_open_date || form.form_open_date === lastAutoOpen) {
        form.form_open_date = newOpen;
        lastAutoOpen = newOpen;
      }
      if (!form.form_due_date || form.form_due_date === lastAutoDue) {
        form.form_due_date = newDue;
        lastAutoDue = newDue;
      }
    }

    // =========================================================
    // SALARY GRADE (modal)
    // =========================================================
    const showSgDialog = ref(false);
    const sgDraft = ref({ from: null, to: null });
    const sgError = ref("");

    const sgLabel = computed(() => {
      const { sg_from, sg_to } = eventForm.value;
      if (!sg_from) return "";
      if (!sg_to || sg_from === sg_to) return `SG ${sg_from}`;
      return `SG ${sg_from} - ${sg_to}`;
    });

    function openSgDialog() {
      sgDraft.value = {
        from: eventForm.value.sg_from,
        to: eventForm.value.sg_to,
      };
      sgError.value = "";
      showSgDialog.value = true;
    }

    function applySg() {
      const from = sgDraft.value.from;
      const to = sgDraft.value.to;
      const hasFrom = from !== null && from !== "" && from !== undefined;
      const hasTo = to !== null && to !== "" && to !== undefined;

      // parehong walang laman = walang SG
      if (!hasFrom && !hasTo) {
        clearSg();
        showSgDialog.value = false;
        return;
      }

      if (!hasFrom) {
        sgError.value = "Please fill in the From field.";
        return;
      }

      if (!Number.isInteger(from) || from < 1 || from > 33) {
        sgError.value = "SG must be a whole number between 1 and 33.";
        return;
      }

      if (hasTo) {
        if (!Number.isInteger(to) || to < 1 || to > 33) {
          sgError.value = "SG must be a whole number between 1 and 33.";
          return;
        }
        if (from > to) {
          sgError.value = "From must not be higher than To.";
          return;
        }
      }

      eventForm.value.sg_from = from;
      eventForm.value.sg_to = hasTo ? to : null; // hindi na kokopyahin ang From
      sgError.value = "";
      showSgDialog.value = false;
    }
    function clearSg() {
      eventForm.value.sg_from = null;
      eventForm.value.sg_to = null;
    }

    function clearSgFromDialog() {
      clearSg();
      sgDraft.value = { from: null, to: null };
      sgError.value = "";
      showSgDialog.value = false;
    }
    // "2026-11-12 17:00" -> "2026-11-12 05:00 PM"  (Y-m-d h:i A)
    function formatFormDate(value) {
      if (!value) return "";
      const [date, time] = value.split(" ");
      const display = formatTimeDisplay(time);
      return display ? `${date} ${display}` : "";
    }

    // =========================================================
    // ASSESSMENT (Pre Test / Post Test, hanggang MAX_ASSESSMENTS)
    // Assessment 1 -> Pre Test, Post Test
    // Assessment 2 -> Pre Test 2, Post Test 2
    // =========================================================
    const MAX_ASSESSMENTS = 2; // dagdagan kung gusto mo pa ng Pre Test 3, etc.
    const assessmentCount = ref(0);

    function buildTests(n) {
      const suffix = n === 1 ? "" : `_${n}`;
      const num = n === 1 ? "" : ` ${n}`;
      return [
        {
          key: `pre${n}`,
          label: `Pre-Test Assessment${num}`,
          formKey: `pre_test_form${suffix}`,
          linkKey: `pre_test_assessment${suffix}`,
          placeholder: "e.g. https://forms.gle/abc123XYZ",
        },
        {
          key: `post${n}`,
          label: `  Post-Test Assessment${num}`,
          formKey: `post_test_form${suffix}`,
          linkKey: `post_test_assessment${suffix}`,
          placeholder: "e.g. https://forms.gle/xyz789ABC",
        },
      ];
    }

    const assessmentTests = computed(() =>
      Array.from({ length: assessmentCount.value }, (_, i) => buildTests(i + 1)).flat()
    );

    function addAssessment() {
      if (assessmentCount.value < MAX_ASSESSMENTS) assessmentCount.value++;
    }

    // Tinatanggal ang pinaka-huling assessment set
    function removeAssessment() {
      const n = assessmentCount.value;
      if (!n) return;

      buildTests(n).forEach((t) => {
        eventForm.value[t.formKey] = null;
        eventForm.value[t.linkKey] = null;
      });

      assessmentCount.value--;
      if (assessmentCount.value === 0) {
        eventForm.value.is_assessment_open = false;
      }
    }

    const showGoogleFormDialog = ref(false);
    const activeTest = ref(null); // "pre1" | "post1" | "pre2" | "post2"

    const activeTestConfig = computed(
      () => assessmentTests.value.find((t) => t.key === activeTest.value) || null
    );

    // laman ng dialog kapag ine-edit ang dating nagawang form
    const builderInitialForm = computed(() =>
      activeTestConfig.value ? eventForm.value[activeTestConfig.value.formKey] : null
    );

    // default title ng form: "<Event Title> - Pre Test"
    // const builderTitle = computed(() => {
    //   const base = eventForm.value.title_name || "";
    //   const label = activeTestConfig.value?.label || "";
    //   return base ? `${base} - ${label}` : label;
    // });

    const builderLabel = computed(() => activeTestConfig.value?.label?.trim() || "");


    function onSaveGoogleForm(form) {
      const test = activeTestConfig.value;
      if (!test) return;

      eventForm.value[test.formKey] = form;

      Notify.create({
        type: "positive",
        message: `${test.label} form saved with ${form.questions.length} question(s).`,
        position: "top",
      });
    }

    function collectScheduleIds(data) {
      const ids = new Set();
      const visit = (value) => {
        if (!value || typeof value !== "object") return;
        if (Array.isArray(value)) {
          value.forEach(visit);
          return;
        }
        const id = value.event_schedule_id ?? value.schedule_id;
        if (id !== undefined && id !== null) ids.add(id);
        Object.values(value).forEach(visit);
      };
      visit(data);
      return [...ids];
    }

    function removeTestForm(test) {
      eventForm.value[test.formKey] = null;
    }
    // Pre-test na kapares ng post-test (post1 -> pre1, post2 -> pre2)
function getPairedPreTest(test) {
  if (!test.key.startsWith("post")) return null;
  const n = test.key.replace("post", "");
  return assessmentTests.value.find((t) => t.key === `pre${n}`) || null;
}

// Lalabas lang ang button kung post-test ito, may laman ang pre-test, at wala pang form ang post-test
function canCopyFromPre(test) {
  const pre = getPairedPreTest(test);
  return !!(pre && eventForm.value[pre.formKey] && !eventForm.value[test.formKey]);
}

function copyFromPreTest(test) {
  const pre = getPairedPreTest(test);
  const source = pre && eventForm.value[pre.formKey];
  if (!source) return;

  const copy = JSON.parse(JSON.stringify(source)); // deep copy

  // bagong record ito, kaya alisin ang mga id ng pre-test
  delete copy.assessmentId;
  copy.title = test.label.trim();
  copy.questions.forEach((q) => {
    delete q.id;
    (q.options || []).forEach((o) => delete o.id);
  });

  eventForm.value[test.formKey] = copy;

  // EventCreatePage: gamitin ang Notify.create
  // EventViewPage: gamitin ang $q.notify
  Notify.create({
    type: "positive",
    message: `Copied ${copy.questions.length} question(s) from ${pre.label.trim()}.`,
    position: "top",
  });
}

    // =========================================================
    // ASSESSMENT MODAL (left: setup, right: preview)
    // =========================================================
    const showAssessmentDialog = ref(false);
    const previewTestKey = ref(null);

    const previewTest = computed(
      () =>
        assessmentTests.value.find((t) => t.key === previewTestKey.value) ||
        assessmentTests.value[0] ||
        null
    );

    const previewForm = computed(() =>
      previewTest.value ? eventForm.value[previewTest.value.formKey] : null
    );

 function requireEventTitle() {
  if (eventForm.value.title_name?.trim()) return true;

  Notify.create({
    type: "warning",
    message: "Please enter an event title first before creating an assessment.",
    position: "top",
  });
  return false;
}

function openAssessmentDialog() {
  if (!requireEventTitle()) return;

  if (assessmentCount.value === 0) addAssessment();
  if (!previewTestKey.value) previewTestKey.value = assessmentTests.value[0]?.key || null;
  showAssessmentDialog.value = true;
}

function openFormBuilder(testKey) {
  if (!requireEventTitle()) return;

  activeTest.value = testKey;
  showGoogleFormDialog.value = true;
}
    function removeAllAssessments() {
      while (assessmentCount.value > 0) removeAssessment();
      previewTestKey.value = null;
    }

    function testStatus(test) {
      const form = eventForm.value[test.formKey];
      if (form) return `${form.title} · ${form.questions.length} question(s)`;
      if (eventForm.value[test.linkKey]) return "Google Form link added";
      return "Not set";
    }

    // Defensive: hindi ko alam eksaktong shape ng questions galing GoogleFormBuilderDialog
    function questionText(q) {
      return q?.question ?? q?.title ?? q?.text ?? q?.label ?? "";
    }

function questionOptions(q) {
  return (q?.options || []).map((o) =>
    typeof o === "string" ? o : o?.option_text ?? o?.label ?? o?.text ?? o?.value ?? ""
  );
}

    function getPassingScore(test) {
  return eventForm.value[test.formKey]?.passing_score ?? "";
}

function setPassingScore(test, value) {
  const form = eventForm.value[test.formKey];
  if (!form) return;
  form.passing_score = value === "" || value === null ? null : Number(value);
}

    watch(
      () => eventForm.value.source_name,
      (source) => {
        if (source === "internal") {
          if (!eventForm.value.sync_to_arms) {
            eventForm.value.sync_to_arms = true;
            armsAutoEnabled = true;

            Swal.fire({
              icon: "info",
              title: "Create Event in ARMS",
              html: `
          Since the event source is <b>In-house</b>, this event will also
          be created in <b>ARMS</b> when you click <b>Create Event</b>.

          <br><br>

          <small style="color: #888; font-size: 15px;">
            You can disable this option anytime in the <b>ARMS</b> section.
          </small>
        `,
              confirmButtonText: "Got it",
              confirmButtonColor: "#18bd4f",
              allowOutsideClick: false,
            });
          }
        } else if (armsAutoEnabled) {
          // nag-switch sa External: i-off lang kung system ang nag-on
          eventForm.value.sync_to_arms = false;
          armsAutoEnabled = false;
        }
      }
    );


    // =========================================================
    // RETURN
    // =========================================================
    return {
      eventStore,
      officeStore,
      saving,
      activeTab,
      eventForm,
      sourceOptions,

      frequencyOptions,
      interventionOptions,

      // Department table (main)
      departmentSearch,
      filteredDepartments,
      departmentColumns,
      departmentPagination,
      // Office table (dialog)
      officeSearch,
      selectedOffices,
      filteredOffices,
      officeColumns,
      officePagination,
      bulkAttendeeCount,
      selectAllOffices,
      clearAllOffices,
      // Functions
      totalAttendees,
      addScheduleSpeaker,
      removeScheduleSpeaker,
      copySpeakersToAll,
      showDateDialog,
      selectedDates,
      openDateDialog,
      applyDates,
      removeSchedule,
      selectedDateRange,
      getScheduleHours,
      showDepartmentDialog,
      openDepartmentDialog,
      updateAttendeeValue,
      applyBulkAttendees,
      addSelectedDepartments,
      removeDepartment,
      goBack,
      cancelCreate,
      createEvent,

      //event component

      //title
      titleOptions,
      titleLoading,
      filterTitles,
      onTitleInput,

      //venue
      venueOptions,
      venueLoading,
      filterVenues,
      onVenuesInput,

      // mode
      modeOptions,
      modeLoading,
      filterModes,
      onModesInput,

      //category
      categoryLoading,
      categoryOptions,
      onCategoryInput,
      filterCategory,

      //type
      typeLoading,
      typeOptions,
      onTypeInput,
      filterType,

      dialogTab,

      activeEmployeeOffice,
      employeeTablePagination,
      employeeColumns,
      departmentOfficeOptions,
      currentOfficeSelectedEmployees,
      allSelectedEmployees,
      selectAllEmployeesForOffice,
      clearAllEmployeesForOffice,
      onOfficeChangeForEmployees,

      showEmployeeRecordDialog,
      selectedEmployeeRecord,
      openEmployeeRecordDialog,

      employeeSearch,
      filteredSuggestedEmployees,

      //competency
      coreOptions,
      technicalOptions,
      leadershipOptions,

      //show office with employee
      showDepartmentEmployeesDialog,
      viewingDepartment,
      openDepartmentEmployeesDialog,

      // forms
      formsOptions,
      evaluationOptions,

      // time restrict
      amOnly,
      pmOnly,

      // salary grade
      showSgDialog,
      sgDraft,
      sgError,
      sgLabel,
      openSgDialog,
      applySg,
      clearSg,
      clearSgFromDialog,
      formatTimeDisplay,
      formatFormDate,

      // assessment (pre test / post test)
      MAX_ASSESSMENTS,
      assessmentCount,
      addAssessment,
      assessmentTests,
      showGoogleFormDialog,
      builderInitialForm,
      // builderTitle,
      openFormBuilder,
      onSaveGoogleForm,
      removeTestForm,
      removeAssessment,

      // assessment modal
      showAssessmentDialog,
      previewTestKey,
      previewTest,
      previewForm,
      openAssessmentDialog,
      removeAllAssessments,
      testStatus,
      questionText,
      questionOptions,

      builderLabel,
      getPassingScore,
      setPassingScore,
      canCopyFromPre,
      copyFromPreTest,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */
.create-event-page {
  min-height: 100%;
  padding: 10px 20px 5px;
  background: #ffffff;
  color: #151515;
}

/* =========================================================
   ERROR BANNER
========================================================= */
.error-banner {
  margin-bottom: 14px;
  font-size: 12px;
}

/* =========================================================
   SECTION TITLE
========================================================= */
.section-title {
  margin-bottom: 5px;
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.forms-title {
  margin-bottom: 9px;
}

/* =========================================================
   INPUT
========================================================= */
.custom-input :deep(.q-field__control) {
  min-height: 35px;
  height: 35px;
  border-radius: 7px;
}

.custom-input :deep(.q-field__native),
.custom-input :deep(.q-field__input),
.custom-input :deep(.q-field__label) {
  font-size: 12px;
}

/* =========================================================
   DIVIDER
========================================================= */
.section-divider {
  height: 1px;
  margin: 10px 0;
  background: #cccccc;
}

/* =========================================================
   SOURCE RADIO GROUP
========================================================= */
.source-radio-group {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 35px;
}

.source-radio-group :deep(.q-radio__label) {
  color: #333333;
  font-size: 12px;
}

/* =========================================================
   ASSESSMENT / DYNAMIC INTERVENTION FORM
========================================================= */
.subsection-title {
  margin-top: 13px;
  margin-bottom: 7px;
}

.assessment-input {
  margin-bottom: 7px;
}

/* =========================================================
   TWO COLUMN
========================================================= */
.two-column-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

/* =========================================================
   SPEAKER
========================================================= */
.speaker-group {
  margin-top: 2px;
  margin-bottom: 12px;
}

.speaker-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 7px;
}

.speaker-input {
  flex: 1.2;
}

.speaker-agency-input {
  flex: 1;
}

.remove-speaker-btn {
  color: #999999;
}

.speaker-action {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.add-speaker-btn {
  min-height: 32px;
  padding: 0 18px;
  border-color: #18bd4f;
  border-radius: 8px;
  color: #18bd4f;
  font-size: 11px;
}

/* =========================================================
   SPEAKERS PER SCHEDULE DATE
========================================================= */
.schedule-item {
  border-bottom: 1px solid #eeeeee;
  margin-top: 15px;
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-item .schedule-row {
  border-bottom: none;
  /* yung border nasa wrapper na */
}

.schedule-speakers {
  padding: 4px 12px 12px 12px;
}

.schedule-speakers-label {
  margin-bottom: 6px;
  color: #555555;
  font-size: 11px;
  font-weight: 600;
}

.speaker-action-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.copy-speaker-btn {
  color: #777777;
  font-size: 11px;
}

.assessment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.assessment-header .forms-title {
  margin-bottom: 0;
}

.create-assessment-btn {
  min-height: 32px;
  padding: 0 18px;
  border-color: #18bd4f;
  border-radius: 8px;
  color: #18bd4f;
  font-size: 11px;
}

.remove-assessment-btn {
  color: #d83d3d;
  font-size: 11px;
}

.add-more-assessment {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

/* =========================================================
   PRE TEST / POST TEST CARDS
========================================================= */
.test-card {
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
}

.test-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.test-card-title {
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.test-form-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 10px;
  border: 1px solid #18bd4f;
  border-radius: 8px;
  background: #f0fbf4;
}

.test-form-summary-text {
  flex: 1;
  min-width: 0;
}

.test-form-summary-title {
  color: #222222;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.test-form-summary-meta {
  color: #777777;
  font-size: 11px;
}

/* =========================================================
   TABS
========================================================= */
.tab-navigation {
  margin-top: 16px;
  margin-bottom: 4px;
  border-bottom: 1px solid #e8e8e8;
}

.tab-navigation :deep(.q-tab) {
  font-size: 12px;
  text-transform: none;
  padding: 0 16px;
  min-height: 36px;
}

.tab-panels {
  background: transparent;
}

.tab-panel {
  padding: 12px 0 0 0;
}

/* =========================================================
   SCHEDULE
========================================================= */
.schedule-heading-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 12px;
}

.selected-date-range {
  color: #333333;
  font-size: 12px;
  font-weight: 500;
  margin-top: 13px;
}

.selected-date-range.empty {
  color: #aaaaaa;
  font-weight: 400;
}

.total-hours-label {
  margin-top: 4px;
  color: #555555;
  font-size: 11px;
}

.total-hours-label strong {
  color: #18bd4f;
  font-size: 12px;
}

.lunch-note {
  margin-left: 4px;
  color: #aaaaaa;
  font-size: 10px;
}

.select-date-btn {
  min-height: 36px;
  padding: 0 15px;
  border-color: #d6d6d6;
  border-radius: 8px;
  color: #18bd4f;
  font-size: 11px;
  flex-shrink: 0;
}

/* =========================================================
   SCHEDULE TABLE
========================================================= */
.schedule-table {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.schedule-table-header,
.schedule-row {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(200px, 1.4fr) 80px 65px;
  align-items: center;
}

.schedule-table-header {
  min-height: 31px;
  padding: 0 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #cccccc;
  color: black;
  font-size: 10px;
  font-weight: 600;
}

.schedule-row {
  min-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #eeeeee;
}

.schedule-row:last-child {
  border-bottom: none;
}

.schedule-row:hover {
  background: #fbfdfb;
}

/* =========================================================
   DATE
========================================================= */
.schedule-date {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #333333;
  font-size: 11px;

}

.schedule-date .q-icon {
  color: #222222;
}

/* =========================================================
   TIME
========================================================= */
.time-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-input {
  width: 130px;
}

.time-input :deep(.q-field__control) {
  min-height: 40px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
}

.time-input :deep(.q-field__native) {
  font-size: 10px;
  cursor: pointer;
}

.time-picker-icon {
  color: #18bd4f;
  cursor: pointer;
}

.time-separator {
  color: #888888;
  font-size: 10px;
}

/* =========================================================
   HOURS
========================================================= */
.hours-column {
  text-align: center;
}

.schedule-hours {
  color: #18bd4f;
  font-size: 11px;
  font-weight: 600;
}

/* =========================================================
   ACTION
========================================================= */
.action-column {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 580;
}

.delete-btn {
  color: #999999
}

.delete-btn:hover {
  color: #d83d3d;
}

/* =========================================================
   EMPTY SCHEDULE
========================================================= */
.schedule-empty {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #aaaaaa;
  font-size: 10px;
  padding: 20px;
}

/* =========================================================
   DEPARTMENT SECTION (MAIN)
========================================================= */
.department-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 16px;
  width: 100%;
}

.attendee-count-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.attendee-count {
  color: #555555;
  font-size: 12px;
  padding: 4px 0;
}

.attendee-count strong {
  color: #18bd4f;
  font-size: 14px;
}

.add-department-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.add-department-btn {
  min-height: 31px;
  padding: 0 16px;
  border-color: #18bd4f;
  border-radius: 7px;
  color: #18bd4f;
  font-size: 10px;
  white-space: nowrap;
}

.department-search {
  margin-bottom: 12px;
}

.department-search :deep(.q-field__control) {
  min-height: 35px;
  height: 35px;
  border-radius: 8px;
}

.department-search :deep(.q-field__native) {
  font-size: 11px;
}

.department-search :deep(.q-field__prepend) {
  padding-right: 5px;
  color: #c8c8c8;
}

/* =========================================================
   DEPARTMENT TABLE (MAIN)
========================================================= */
.department-table-container {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.department-table {
  width: 100%;
}

.department-table :deep(.q-table__top) {
  padding: 6px 12px;
  background: #f8f9fa;
}

.department-table :deep(.q-table thead tr) {
  background: #f5f5f5;
}

.department-table :deep(.q-table th) {
  font-size: 11px;
  font-weight: 600;
  color: #555555;
  padding: 8px 12px;
  border-bottom: 2px solid #e0e0e0;
}

.department-table :deep(.q-table td) {
  padding: 6px 12px;
  font-size: 12px;
}

.department-name-cell {
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  line-height: 1.4;
  font-size: 11px;
}

.attendee-input-main {
  max-width: 90px;
  margin: 0 auto;
}

.attendee-input-main :deep(.q-field__control) {
  min-height: 30px;
  height: 30px;
  border-radius: 6px;
}

.attendee-input-main :deep(.q-field__native) {
  font-size: 11px;
  text-align: center;
}

.add-department-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.add-department-btn {
  min-height: 31px;
  border-color: #18bd4f;
  border-radius: 7px;
  color: #18bd4f;
  font-size: 10px;
}

/* =========================================================
   PAGE ACTIONS
========================================================= */
.page-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.cancel-btn {
  min-height: 38px;
  padding: 0 22px;
  border-radius: 8px;
  color: #ffffff;
  background: red;
  font-size: 11px;
  font-weight: 600;
}

.create-btn {
  min-height: 38px;
  padding: 0 22px;
  border-radius: 8px;
  color: #ffffff;
  background: #18bd4f;
  font-size: 11px;
  font-weight: 600;
}

/* =========================================================
   DIALOG
========================================================= */
.date-dialog {
  width: 470px;
  max-width: 92vw;
  border-radius: 13px;
}

.date-dialog-body {
  padding: 18px;
}

.dialog-actions {
  padding: 11px 18px;
  background: #fafafa;
}

.save-dialog-btn {
  min-height: 35px;
  padding: 0 17px;
  border-radius: 8px;
  color: white;
  background: #18bd4f;
  font-size: 11px;
}

.save-dialog-btn:disabled {
  opacity: 0.5;
}

/* =========================================================
   DEPARTMENT DIALOG
========================================================= */
.department-dialog {
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  max-height: 90vh;
  border-radius: 13px;
  display: flex;
  flex-direction: column;
}

.department-dialog-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 18px 20px;
  overflow: hidden;
}

.office-search {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.office-search :deep(.q-field__control) {
  border-radius: 8px;
}

.quick-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.select-all-btn,
.clear-all-btn {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 11px;
  text-transform: none;
}

.select-all-btn {
  color: #18bd4f;
}

.clear-all-btn {
  color: #d83d3d;
}

.selected-badge {
  flex-shrink: 0;
}

.bulk-attendee-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-input :deep(.q-field__control) {
  border-radius: 8px;
  min-height: 36px;
  height: 36px;
}

.bulk-input :deep(.q-field__native) {
  font-size: 12px;
}

.apply-bulk-btn {
  font-size: 11px;
  padding: 0 12px;
  height: 36px;
  text-transform: none;
  border: 1px solid #18bd4f;
  border-radius: 8px;
}

.apply-bulk-btn:disabled {
  opacity: 0.4;
}

.offices-table-container {
  flex: 1;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.offices-table {
  width: 100%;
}

.offices-table :deep(.q-table__top) {
  padding: 6px 12px;
  background: #f8f9fa;
}

.offices-table :deep(.q-table thead tr) {
  background: #f5f5f5;
}

.offices-table :deep(.q-table th) {
  font-size: 11px;
  font-weight: 600;
  color: #555555;
  padding: 8px 12px;
  border-bottom: 2px solid #e0e0e0;
}

.offices-table :deep(.q-table td) {
  padding: 6px 12px;
  font-size: 12px;
}

.office-name-cell {
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  line-height: 1.4;
  font-size: 12px;
}

.attendee-input-cell {
  max-width: 140px;
  margin: 0 auto;
}

.attendee-input-cell :deep(.q-field__control) {
  min-height: 32px;
  height: 32px;
  border-radius: 6px;
}

.attendee-input-cell :deep(.q-field__native) {
  font-size: 12px;
  text-align: center;
}

.attendee-input-cell :deep(.q-field__append) {
  padding-left: 4px;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #999999;
}

.loading-state>div {
  margin-top: 10px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #b0b0b0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
}

.no-data-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #b0b0b0;
}

.no-data-state>div,
.empty-state>div {
  margin-top: 8px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 650px) {
  .create-event-page {
    padding: 20px 12px;
  }

  .two-column-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .speaker-row {
    flex-wrap: wrap;
  }

  .speaker-input,
  .speaker-agency-input {
    flex: 1 1 100%;
  }

  .schedule-heading-row {
    flex-direction: column;
    align-items: stretch;
  }

  .select-date-btn {
    width: 100%;
  }

  .schedule-table-header,
  .schedule-row {
    grid-template-columns: 1fr 1fr 55px 40px;
  }

  .time-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
  }

  .time-separator {
    display: none;
  }

  .time-input {
    width: 100%;
  }

  .schedule-hours {
    font-size: 10px;
  }

  .page-actions {
    justify-content: stretch;
  }

  .page-actions .cancel-btn,
  .page-actions .create-btn {
    flex: 1;
  }

  .department-dialog {
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .quick-actions-row {
    flex-direction: column;
    align-items: stretch;
  }

  .selection-actions {
    justify-content: space-between;
  }

  .bulk-attendee-wrapper {
    width: 100%;
  }

  .bulk-input {
    width: 100% !important;
  }

  .apply-bulk-btn {
    flex: 1;
  }

  .offices-table :deep(.q-table td),
  .offices-table :deep(.q-table th) {
    padding: 4px 8px;
    font-size: 11px;
  }

  .office-name-cell {
    font-size: 11px;
  }

  .attendee-input-cell {
    max-width: 100px;
  }

  .attendee-input-cell :deep(.q-field__native) {
    font-size: 11px;
  }

  .department-table :deep(.q-table td),
  .department-table :deep(.q-table th) {
    padding: 4px 8px;
    font-size: 11px;
  }

  .department-name-cell {
    font-size: 10px;
  }

  .attendee-input-main {
    max-width: 70px;
  }

  .tab-navigation :deep(.q-tab) {
    font-size: 11px;
    padding: 0 12px;
    min-height: 32px;
  }

  .title-dropdown-scroll {
    max-height: 250px;
    overflow-y: auto;
  }
}

.trained-row {
  background-color: #fdecea;
  /* light red background */
}

.trained-row :deep(td) {
  color: #c62828;
  /* red text sa buong row */
}

.employee-record-dialog {
  width: 1500px;
  /* mas malapad para hindi putol ang columns */
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 13px;
  display: flex;
  flex-direction: column;
}

.employee-record-body {
  padding: 25px;
  flex: 1;
  overflow-y: auto;
}

.record-section-title {
  margin-bottom: 8px;
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.training-title {
  margin-top: 20px;
}

.record-table :deep(th) {
  font-size: 12px;
  background: #f5f5f5;
}

.record-table :deep(td) {
  font-size: 12px;
}

.record-empty {
  padding: 16px;
  text-align: center;
  color: #aaaaaa;
  font-size: 12px;
  border: 1px dashed #e0e0e0;
  border-radius: 6px;
}

.employee-search-spacing {
  margin-top: 14px;
}


.competency-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.competency-group {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 10px 14px;
  background: #fafafa;
}

.competency-group-title {
  margin-bottom: 6px;
  color: #333333;
  font-size: 12px;
  font-weight: 650;
}

.competency-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 10px;
}

.competency-checkbox {
  margin-bottom: 0;
  font-size: 12px;
}

.competency-checkbox :deep(.q-checkbox__label) {
  font-size: 11.5px;
  line-height: 1.3;
}

@media (max-width: 650px) {
  .competency-grid {
    grid-template-columns: 1fr;
  }
}

.source-hint {
  color: #666666;
  font-size: 11px;
}

.action-btn-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.department-employees-dialog {
  width: 480px;
  max-width: 92vw;
  border-radius: 13px;
}

.department-employees-body {
  padding: 18px;
  max-height: 60vh;
  overflow-y: auto;
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.employee-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
}

.employee-list-name {
  color: #222222;
  font-size: 12px;
  font-weight: 600;
}

.employee-list-position {
  color: #888888;
  font-size: 11px;
}

/* =========================================================
   FORMS (left panel)
========================================================= */
.forms-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.forms-list :deep(.q-checkbox) {
  min-height: 30px;
}

.forms-list :deep(.q-checkbox__label) {
  color: #373737;
  font-size: 13px;
}

/* Qualifications: full width + malaking textarea */
.qualifications-field {
  grid-column: 1 / -1;
  /* tumatawid sa dalawang column */
}

.qualifications-input :deep(.q-field__control) {
  height: auto;
  min-height: 110px;
  border-radius: 7px;
}

.qualifications-input :deep(.q-field__native) {
  min-height: 90px;
  font-size: 12px;
  resize: vertical;
  /* pwedeng i-drag para palakihin pa */
}

/* =========================================================
   ARMS INTEGRATION
========================================================= */
.arms-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fafafa;
  transition: background 0.2s, border-color 0.2s;
}

.arms-card--on {
  border-color: #18bd4f;
  background: #f0fbf4;
}

.arms-card-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.arms-card-icon {
  margin-top: 2px;
  color: #18bd4f;
}

.arms-card-title {
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.arms-card-desc {
  margin-top: 2px;
  color: #777777;
  font-size: 12px;
  line-height: 1.35;
}

.arms-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: #666666;
  font-size: 12px;
}

.arms-hint-text {
  color: #666666;
  font-size: 12px;
}

.arms-card--off {
  background: #fdecea;
  border-color: #ef5350;
}

.arms-card--off .arms-card-title {
  color: #c62828;
}

.arms-card--off .arms-card-desc {
  color: #d32f2f;
}

.arms-card--off .arms-card-icon {
  color: #ef5350;
}

.time-column-text {
  text-align: center;
  font-size: 12px;
  font-weight: 580;
}

.date-column-text {
  font-size: 12px;
  font-weight: 580;
}

.form-schedule {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

@media (max-width: 650px) {
  .form-schedule {
    grid-template-columns: 1fr;
  }
}

.sg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  padding: 6px 10px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}

.sg-row-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
}

.sg-row-label {
  color: #555555;
  font-size: 12px;
  font-weight: 600;
}

.sg-row-empty {
  color: #aaaaaa;
  font-size: 12px;
}

.sg-chip {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
}

.sg-set-btn {
  min-height: 30px;
  padding: 0 14px;
  border-color: #18bd4f;
  border-radius: 8px;
  color: #18bd4f;
  font-size: 11px;
}

/* dialog */
.sg-dialog {
  width: 420px;
  max-width: 92vw;
  border-radius: 13px;
}

.sg-dialog-body {
  padding: 18px;
}

.sg-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sg-input {
  flex: 1;
}

.sg-separator {
  color: #666666;
  font-size: 12px;
}

.sg-error {
  margin-top: 10px;
  color: #d83d3d;
  font-size: 12px;
}

.sg-hint {
  margin-top: 10px;
  color: #888888;
  font-size: 11px;
}

/* =========================================================
   ASSESSMENT SUMMARY (page) + MODAL
========================================================= */
.assessment-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.assessment-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fafafa;
}

.assessment-summary-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.assessment-summary-status--open {
  background: #e6f7ec;
  color: #1b7f3b;
}

.assessment-summary-status--closed {
  background: #fdecea;
  color: #c62828;
}

.assessment-summary-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.assessment-summary-label {
  color: #222222;
  font-weight: 600;
  min-width: 80px;
}

.assessment-summary-meta {
  color: #777777;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assessment-dialog {
  width: 1100px;
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 13px;
  display: flex;
  flex-direction: column;
}

.assessment-dialog-body {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
}

.assessment-modal-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 20px;
  align-items: start;
}

.assessment-modal-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assessment-modal-right {
  position: sticky;
  top: 0;
}

.test-card--clickable {
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.test-card--active {
  border-color: #18bd4f;
  box-shadow: 0 0 0 2px rgba(24, 189, 79, 0.15);
}

.preview-label {
  margin-bottom: 8px;
  color: #555555;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.preview-card {
  min-height: 320px;
  padding: 18px 20px;
  border: 1px solid #e0e0e0;
  border-top: 8px solid #18bd4f;
  border-radius: 10px;
  background: #ffffff;
}

.preview-event {
  color: #222222;
  font-size: 16px;
  font-weight: 700;
}

.preview-test {
  margin-top: 2px;
     font-size: 14px;
  color: #555;

}

.preview-separator {
  margin: 12px 0;
}

.preview-form-title {
  color: #222222;
  font-size: 14px;
  font-weight: 650;
}

.preview-form-desc {
  margin-top: 4px;
  color: #777777;
  font-size: 12px;
}

.preview-question {
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
}

.preview-question-text {
  color: #222222;
  font-size: 12px;
  font-weight: 600;
}

.preview-options {
  margin: 6px 0 0;
  padding-left: 18px;
  color: #555555;
  font-size: 12px;
}

.preview-answer-line {
  margin-top: 8px;
  padding-bottom: 4px;
  border-bottom: 1px dashed #cccccc;
  color: #aaaaaa;
  font-size: 11px;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 200px;
  color: #aaaaaa;
  font-size: 12px;
  text-align: center;
}

.preview-link {
  max-width: 100%;
  color: #18bd4f;
  word-break: break-all;
}

@media (max-width: 900px) {
  .assessment-modal-grid {
    grid-template-columns: 1fr;
  }

  .assessment-modal-right {
    position: static;
  }
}
.assessment-toggle-card {
  margin-bottom: 10px;
}
.copy-pre-btn {
  color: #555555;
  font-size: 11px;
}
</style>

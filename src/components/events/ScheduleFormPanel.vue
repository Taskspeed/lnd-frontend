<template>
  <div class="schedule-form-panel">
    <div class="form-header">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        class="back-btn"
        @click="$emit('cancel')"
      >
        <q-tooltip>Back to Schedules</q-tooltip>
      </q-btn>
      <div class="section-title form-title">
        {{ isEditing ? "Edit Schedule" : "Add Schedule" }}
      </div>
    </div>

    <!-- ERROR -->
    <q-banner
      v-if="errorMessage"
      dense
      rounded
      class="bg-red-2 text-red-9 error-banner"
    >
      {{ errorMessage }}
    </q-banner>

    <div class="section-title">Schedule Details</div>

    <!-- VENUE -->
    <LabeledField label="Venue">
      <q-select
        v-model="eventForm.venue_name"
        outlined
        dense
        use-input
        hide-selected
        fill-input
        input-debounce="400"
        new-value-mode="add-unique"
        :options="venueOptions"
        :loading="venueLoading"
        @filter="filterVenues"
        @input-value="onVenuesInput"
        placeholder="Enter event venue"
        popup-content-class="title-dropdown-scroll"
        class="custom-input"
      />
    </LabeledField>

    <!-- CATEGORY / TYPE / MODE / CONDUCTOR / SOURCE / HOURS / QUALIFICATIONS / FEE -->
    <div class="two-column-fields">
     <LabeledField label="Learning Type">
          <q-select v-model="eventForm.intervention_name" outlined dense emit-value map-options
            :options="interventionOptions" placeholder="Select Intervention" class="custom-input" :display-value="eventForm.intervention_name ? undefined : 'Select Intervention'
              " />
        </LabeledField>

              <!-- SOURCE (DROPDOWN) -->
      <LabeledField label="Source">
        <q-select
          v-model="eventForm.source_name"
          outlined
          dense
          emit-value
          map-options
          :options="sourceOptions"
          placeholder="Select Source"
          class="custom-input"
          :display-value="eventForm.source_name ? undefined : 'Select Source'"
        />
        <div v-if="eventForm.source_name" class="source-hint">
          {{
            eventForm.source_name === "internal"
              ? "Training conducted by HRDD"
              : "Training through Concerned Office"
          }}
        </div>
      </LabeledField>
      <LabeledField label="Compentecy">
        <q-select
          v-model="eventForm.category_name"
          outlined
          dense
          use-input
          hide-selected
          fill-input
          input-debounce="400"
          new-value-mode="add-unique"
          :options="categoryOptions"
          :loading="categoryLoading"
          @filter="filterCategory"
          @input-value="onCategoryInput"
          popup-content-class="title-dropdown-scroll"
          placeholder="Enter event category"
          class="custom-input"
        />
      </LabeledField>


      
      <LabeledField label="Hours">
        <q-input
          v-model.number="eventForm.hours"
          type="number"
          outlined
          dense
          min="0"
          placeholder="Enter number of hours"
          class="custom-input"
        />
      </LabeledField>

      <LabeledField label="Activity">
        <q-select
          v-model="eventForm.type_name"
          outlined
          dense
          use-input
          hide-selected
          fill-input
          input-debounce="400"
          new-value-mode="add-unique"
          :options="typeOptions"
          :loading="typeLoading"
          @filter="filterType"
          @input-value="onTypeInput"
          placeholder="Enter event type"
          popup-content-class="title-dropdown-scroll"
          class="custom-input"
        />
      </LabeledField>

         <LabeledField label="Conductor">
        <q-input
          v-model="eventForm.conducted_by"
          outlined
          dense
          placeholder="Enter conductor"
          class="custom-input"
        />
      </LabeledField>
      <LabeledField label="Mode">
        <q-select
          v-model="eventForm.mode_name"
          outlined
          dense
          use-input
          hide-selected
          fill-input
          input-debounce="400"
          new-value-mode="add-unique"
          :options="modeOptions"
          :loading="modeLoading"
          @filter="filterModes"
          @input-value="onModesInput"
          placeholder="Enter event mode"
          popup-content-class="title-dropdown-scroll"
          class="custom-input"
        />
      </LabeledField>

   
     <LabeledField label="fee">
        <q-input
          v-model="eventForm.fee"
          outlined
          dense
          placeholder="fee"
          class="custom-input"
        />
      </LabeledField>


      <LabeledField label="Qualifications">
        <q-input
          v-model="eventForm.qualifications"
          outlined
          dense
          type="text"
          placeholder="Enter qualifications"
          class="custom-input"
        />
      </LabeledField>

 
    </div>

    <div class="section-divider"></div>

    <!-- RESOURCE SPEAKER -->
    <LabeledField label="Resource Speaker" class="speaker-group">
      <div
        v-for="(speaker, index) in eventForm.speakers"
        :key="speaker.id"
        class="speaker-row"
      >
        <q-input
          v-model="speaker.name"
          outlined
          dense
          placeholder="Enter resource speaker"
          class="custom-input speaker-input"
        />

        <q-input
          v-model="speaker.position"
          outlined
          dense
          placeholder="Position"
          class="custom-input speaker-agency-input"
        />

        <q-input
          v-model="speaker.agency"
          outlined
          dense
          placeholder="Agency"
          class="custom-input speaker-agency-input"
        />


        <q-btn
          v-if="eventForm.speakers.length > 1"
          flat
          round
          dense
          icon="close"
          class="remove-speaker-btn"
          @click="removeSpeaker(index)"
        >
          <q-tooltip>Remove Speaker</q-tooltip>
        </q-btn>
      </div>

      <div class="speaker-action">
        <q-btn
          outline
          no-caps
          icon="add"
          label="Add Another Speaker"
          class="add-speaker-btn"
          @click="addSpeaker"
        />
      </div>
    </LabeledField>

    <!-- COMPETENCY -->
    <div class="section-divider"></div>
    <div class="section-title forms-title">Competency</div>

    <div class="competency-groups">
      <div class="competency-group">
        <div class="competency-group-title">Core</div>
        <div class="competency-grid">
          <q-checkbox
            v-for="option in coreOptions"
            :key="option.value"
            v-model="eventForm.competencies"
            :val="option.value"
            :label="option.label"
            color="green"
            keep-color
            dense
            class="competency-checkbox"
          />
        </div>
      </div>

      <div class="competency-group">
        <div class="competency-group-title">Technical</div>
        <div class="competency-grid">
          <q-checkbox
            v-for="option in technicalOptions"
            :key="option.value"
            v-model="eventForm.competencies"
            :val="option.value"
            :label="option.label"
            color="green"
            keep-color
            dense
            class="competency-checkbox"
          />
        </div>
      </div>

      <div class="competency-group">
        <div class="competency-group-title">Leadership</div>
        <div class="competency-grid">
          <q-checkbox
            v-for="option in leadershipOptions"
            :key="option.value"
            v-model="eventForm.competencies"
            :val="option.value"
            :label="option.label"
            color="green"
            keep-color
            dense
            class="competency-checkbox"
          />
        </div>
      </div>
    </div>

    <!-- TABS: SCHEDULE DATE & DEPARTMENT -->
    <q-tabs
      v-model="activeTab"
      dense
      class="tab-navigation"
      active-color="green"
      indicator-color="green"
      align="left"
      narrow-indicator
    >
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

          <q-btn
            outline
            no-caps
            icon="calendar_month"
            label="Select Date"
            class="select-date-btn"
            @click="openDateDialog"
          />
        </div>

        <!-- SCHEDULE TABLE -->
        <div class="schedule-table">
          <div class="schedule-table-header">
            <div class="date-column">Date</div>
            <div class="time-column">Time</div>
            <div class="action-column">Action</div>
          </div>

          <div
            v-for="(schedule, index) in eventForm.schedules"
            :key="schedule.id"
            class="schedule-row"
          >
            <div class="date-column schedule-date">
              <q-icon name="calendar_today" size="15px" />
              <span>{{ schedule.date }}</span>
            </div>

            <div class="time-column">
              <div class="time-inputs">
                <!-- MORNING IN -->
                <q-input
                  :model-value="formatTimeDisplay(schedule.morning_in)"
                  outlined
                  dense
                  placeholder="Morning In"
                  class="time-input"
                >
                  <template #append>
                    <q-icon name="access_time" class="time-picker-icon">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="schedule.morning_in" mask="HH:mm" color="green">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="green" flat no-caps />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

                <!-- MORNING OUT -->
                <q-input
                  :model-value="formatTimeDisplay(schedule.morning_out)"
                  outlined
                  dense
                  placeholder="Morning Out"
                  class="time-input"
                >
                  <template #append>
                    <q-icon name="access_time" class="time-picker-icon">
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

                <!-- AFTERNOON IN -->
                <q-input
                  :model-value="formatTimeDisplay(schedule.afternoon_in)"
                  outlined
                  dense
                  placeholder="Afternoon In"
                  class="time-input"
                >
                  <template #append>
                    <q-icon name="access_time" class="time-picker-icon">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="schedule.afternoon_in" mask="HH:mm" color="green">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="green" flat no-caps />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

                <!-- AFTERNOON OUT -->
                <q-input
                  :model-value="formatTimeDisplay(schedule.afternoon_out)"
                  outlined
                  dense
                  placeholder="Afternoon Out"
                  class="time-input"
                >
                  <template #append>
                    <q-icon name="access_time" class="time-picker-icon">
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

            <div class="action-column">
              <q-btn
                flat
                round
                dense
                icon="delete"
                class="delete-btn"
                color="red"
                @click="removeScheduleRow(index)"
              >
                <q-tooltip>Remove Date</q-tooltip>
              </q-btn>
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
            <q-btn
              outline
              no-caps
              icon="add"
              label="Add Department"
              class="add-department-btn"
              @click="openDepartmentDialog"
            />
          </div>
        </div>

        <q-input
          v-model="departmentSearch"
          outlined
          dense
          clearable
          placeholder="Search departments..."
          class="department-search"
        >
          <template #prepend>
            <q-icon name="search" size="17px" />
          </template>
        </q-input>

        <!-- Department Table -->
        <div class="department-table-container">
          <q-table
            :rows="filteredDepartments"
            :columns="departmentColumns"
            row-key="id"
            :rows-per-page-options="[5, 10, 25]"
            v-model:pagination="departmentPagination"
            class="department-table"
            flat
            bordered
          >
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
                <q-input
                  v-model.number="props.row.attendees"
                  type="number"
                  min="0"
                  outlined
                  dense
                  class="attendee-input-main"
                />
              </q-td>
            </template>

            <!-- Action Column -->
            <template #body-cell-action="props">
              <q-td :props="props">
                <div class="action-btn-group">
                  <q-btn
                    flat
                    round
                    dense
                    icon="visibility"
                    color="primary"
                    @click="openDepartmentEmployeesDialog(props.row)"
                  >
                    <q-tooltip>View Selected Employees</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    dense
                    icon="delete_outline"
                    class="delete-btn"
                    @click="removeDepartment(props.rowIndex)"
                  >
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

    <!-- FORM ACTIONS -->
    <div class="page-actions">
      <q-btn
        flat
        no-caps
        label="Cancel"
        class="cancel-btn"
        @click="$emit('cancel')"
      />

      <q-btn
        unelevated
        no-caps
        :label="isEditing ? 'Save Changes' : 'Add Schedule'"
        class="create-btn"
        :loading="saving"
        @click="save"
      />
    </div>

    <!-- =========================================================
         DATE DIALOG
    ========================================================== -->
    <q-dialog v-model="showDateDialog">
      <q-card class="date-dialog">
        <EventDialogHeader
          title="Select Schedule Dates"
          subtitle="Select one or multiple dates for this schedule."
        />

        <q-separator />

        <q-card-section class="date-dialog-body">
          <q-date
            v-model="selectedDates"
            multiple
            today-btn
            mask="YYYY-MM-DD"
            color="green"
            minimal
            class="full-width"
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Apply Dates"
            class="save-dialog-btn"
            @click="applyDates"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =========================================================
         DEPARTMENT DIALOG
    ========================================================== -->
    <q-dialog
      v-model="showDepartmentDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="department-dialog">
        <EventDialogHeader
          title="Add Departments &amp; Employees"
          subtitle="Select departments/employees and specify the number of attendees for each."
        />

        <q-separator />

        <!-- TABS: DEPARTMENT / EMPLOYEE -->
        <q-tabs
          v-model="dialogTab"
          dense
          class="tab-navigation"
          active-color="green"
          indicator-color="green"
          align="left"
          narrow-indicator
        >
          <q-tab name="department" label="Department" />
          <q-tab name="employee" label="Employee" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="dialogTab" animated class="department-dialog-body">
          <!-- ===================== DEPARTMENT PANEL ===================== -->
          <q-tab-panel name="department" class="dialog-tab-panel">
            <!-- Search Bar -->
            <q-input
              v-model="officeSearch"
              outlined
              dense
              clearable
              placeholder="Search departments..."
              class="office-search"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- Quick Actions Row -->
            <div class="quick-actions-row">
              <div class="selection-actions">
                <q-btn
                  flat
                  dense
                  no-caps
                  label="Select All"
                  class="select-all-btn"
                  :disable="!filteredOffices.length"
                  @click="selectAllOffices"
                />
                <q-btn
                  flat
                  dense
                  no-caps
                  label="Clear All"
                  class="clear-all-btn"
                  :disable="!selectedOffices.length"
                  @click="clearAllOffices"
                />

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
                <q-input
                  v-model.number="bulkAttendeeCount"
                  type="number"
                  min="0"
                  outlined
                  dense
                  placeholder="Set all to"
                  class="bulk-input"
                  style="width: 120px"
                />
                <q-btn
                  flat
                  no-caps
                  color="green"
                  label="Apply to All Selected"
                  :disable="
                    selectedOffices.length === 0 ||
                    bulkAttendeeCount === null ||
                    bulkAttendeeCount === ''
                  "
                  @click="applyBulkAttendees"
                  class="apply-bulk-btn"
                />
              </div>
            </div>

            <!-- Offices Table -->
            <div class="offices-table-container">
              <q-table
                :rows="filteredOffices"
                :columns="officeColumns"
                row-key="officeId"
                :loading="officeStore.loading"
                :rows-per-page-options="[5, 10, 25, 50]"
                v-model:pagination="officePagination"
                binary-state-sort
                selection="multiple"
                v-model:selected="selectedOffices"
                class="offices-table"
                flat
                bordered
              >
                <!-- Office Name Column -->
                <template #body-cell-office_name="props">
                  <q-td :props="props">
                    <div class="office-name-cell">
                      {{ props.row.office_name }}
                    </div>
                  </q-td>
                </template>

                <!-- Attendees Column -->
                <template #body-cell-attendees="props">
                  <q-td :props="props">
                    <q-input
                      v-model.number="props.row._attendees"
                      type="number"
                      min="0"
                      outlined
                      dense
                      placeholder="0"
                      class="attendee-input-cell"
                      @update:model-value="updateAttendeeValue(props.row)"
                    >
                      <template #append>
                        <q-icon name="people" color="grey-6" size="18px" />
                      </template>
                    </q-input>
                  </q-td>
                </template>

                <!-- Loading State -->
                <template #loading>
                  <div class="loading-state">
                    <q-spinner-dots color="green" size="40px" />
                    <div>Loading departments...</div>
                  </div>
                </template>

                <!-- No Data State -->
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
            <q-select
              v-model="activeEmployeeOffice"
              outlined
              dense
              emit-value
              map-options
              :options="departmentOfficeOptions"
              :loading="eventStore.loading"
              label="Select Office"
              class="custom-input"
              @update:model-value="onOfficeChangeForEmployees"
            />

            <div v-if="!activeEmployeeOffice" class="empty-state">
              <q-icon name="info" size="28px" color="grey-4" />
              <div>Select an office above to view suggested employees.</div>
            </div>

            <template v-else>
              <!-- SEARCH BAR -->
              <q-input
                v-model="employeeSearch"
                outlined
                dense
                clearable
                placeholder="Search employees..."
                class="office-search employee-search-spacing"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>

              <div class="quick-actions-row">
                <div class="selection-actions">
                  <q-btn
                    flat
                    dense
                    no-caps
                    label="Select All"
                    class="select-all-btn"
                    :disable="!filteredSuggestedEmployees.length"
                    @click="selectAllEmployeesForOffice"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    label="Clear All"
                    class="clear-all-btn"
                    :disable="!currentOfficeSelectedEmployees.length"
                    @click="clearAllEmployeesForOffice"
                  />

                  <div class="selected-badge" v-if="currentOfficeSelectedEmployees.length > 0">
                    <q-badge color="green" text-color="white" rounded>
                      {{ currentOfficeSelectedEmployees.length }} employee{{
                        currentOfficeSelectedEmployees.length > 1 ? "s" : ""
                      }}
                      selected
                    </q-badge>
                  </div>
                </div>
              </div>

              <div class="offices-table-container">
                <q-table
                  :rows="filteredSuggestedEmployees"
                  :columns="employeeColumns"
                  row-key="ControlNo"
                  :loading="eventStore.loading"
                  :rows-per-page-options="[5, 10, 25, 50]"
                  v-model:pagination="employeeTablePagination"
                  selection="multiple"
                  v-model:selected="currentOfficeSelectedEmployees"
                  class="offices-table"
                  flat
                  bordered
                >
                  <template #body="props">
                    <q-tr :props="props" :class="{ 'trained-row': props.row.isAlreadyTrained }">
                      <q-td auto-width>
                        <q-checkbox v-model="props.selected" />
                      </q-td>

                      <q-td v-for="col in props.cols" :key="col.name" :props="props">
                        <template v-if="col.name === 'isAlreadyTrained'">
                          <q-badge :color="props.row.isAlreadyTrained ? 'red' : 'green'">
                            {{ props.row.isAlreadyTrained ? "Yes" : "No" }}
                          </q-badge>
                        </template>
                        <template v-else-if="col.name === 'Action'">
                          <q-btn
                            flat
                            dense
                            round
                            icon="visibility"
                            color="primary"
                            @click="openEmployeeRecordDialog(props.row)"
                          >
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
          <q-btn
            unelevated
            no-caps
            label="Add Selected"
            class="save-dialog-btn"
            :disable="selectedOffices.length === 0 && allSelectedEmployees.length === 0"
            @click="addSelectedDepartments"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =========================================================
         EMPLOYEE RECORD DIALOG (Civil Service + Training)
    ========================================================== -->
    <q-dialog v-model="showEmployeeRecordDialog">
      <q-card class="employee-record-dialog">
        <EventDialogHeader
          :title="selectedEmployeeRecord?.name || 'Employee Record'"
          :subtitle="selectedEmployeeRecord?.position || ''"
        />

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
                  <td>{{ cs.LNumber || "—" }}</td>
                  <td>{{ cs.LDate || "—" }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
          <div v-else class="record-empty">No civil service records found.</div>

          <!-- TRAINING SECTION -->
          <div class="record-section-title training-title">Training History</div>

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
          <div v-else class="record-empty">No training records found.</div>
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
        <EventDialogHeader
          :title="viewingDepartment?.name || 'Selected Employees'"
          :subtitle="`${viewingDepartment?.employees?.length || 0} employee(s) selected`"
        />

        <q-separator />

        <q-card-section class="department-employees-body">
          <div v-if="viewingDepartment?.employees?.length" class="employees-list">
            <div
              v-for="emp in viewingDepartment.employees"
              :key="emp.control_no"
              class="employee-list-item"
            >
              <q-icon name="person" size="18px" color="grey-6" />
              <div class="employee-list-info">
                <div class="employee-list-name">{{ emp.name }}</div>
                <div v-if="emp.position" class="employee-list-position">{{ emp.position }}</div>
                <div v-if="emp.status" class="employee-list-position">{{ emp.status }}</div>
              </div>
            </div>
          </div>

          <div v-else class="record-empty">No employees selected for this department.</div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { useEventStore } from "stores/eventStore";
import { useOfficeStore } from "stores/officeStore";

import { useModeStore } from "src/stores/library/event/modeStore";
import { useVenueStore } from "src/stores/library/event/venueStore";
import { useCategoryStore } from "src/stores/library/event/categoryStore";
import { useTypeStore } from "src/stores/library/event/typeStore";

import { coreOptions, technicalOptions, leadershipOptions } from "src/constants/competency";
import { sourceOptions } from "src/constants/source";
import { buildCompetenciesPayload } from "src/composables/event/useCreateEventPayload";

import EventDialogHeader from "components/events/EventDialogHeader.vue";
import LabeledField from "components/events/LabeledField.vue";

import { useScheduleStore } from "src/stores/event/schedule/scheduleStore";

export default defineComponent({
  name: "ScheduleFormPanel",

  components: {
    EventDialogHeader,
    LabeledField,
  },

  props: {
    eventId: {
      type: [String, Number],
      required: true,
    },
    // null = Add mode. Pass the schedule row object = Edit mode.
    schedule: {
      type: Object,
      default: null,
    },
  },

  emits: ["saved", "cancel"],

  setup(props, { emit }) {
    const $q = useQuasar();
    const eventStore = useEventStore();
    const officeStore = useOfficeStore();
    const scheduleStore = useScheduleStore()

    // library stores (same as EventCreatePage)
    const modeStore = useModeStore();
    const modeOptions = ref([]);
    const modeLoading = ref(false);

    const venueStore = useVenueStore();
    const venueOptions = ref([]);
    const venueLoading = ref(false);

    const categoryStore = useCategoryStore();
    const categoryOptions = ref([]);
    const categoryLoading = ref(false);

    const typeStore = useTypeStore();
    const typeOptions = ref([]);
    const typeLoading = ref(false);

    const isEditing = computed(() => !!props.schedule);
    const saving = ref(false);
    const errorMessage = ref("");
    const activeTab = ref("schedule");

    // =========================================================
    // FORM STATE (mirrors EventCreatePage "Schedule Details")
    // =========================================================
    const eventForm = ref({
      venue_name:
        props.schedule?.venue_name === "—" ? "" : props.schedule?.venue_name || "",
      category_name: props.schedule?.category_name || null,
      type_name: props.schedule?.type_name || null,
      mode_name: props.schedule?.mode_name || null,
      conducted_by: props.schedule?.conducted_by || "",
      source_name: props.schedule?.source_name || null,
      hours: props.schedule?.hours ?? null,
      qualifications: props.schedule?.qualifications || "",
      fee: props.schedule?.fee || "",
      competencies: props.schedule?.competencies || [],

      speakers: props.schedule?.speakers?.length
        ? props.schedule.speakers.map((s, i) => ({
            id: Date.now() + i,
            name: s.name || s.speaker_name || "",
            agency: s.agency || s.agency_name || "",
            position: s.position || s.position || "",
          }))
        : [{ id: Date.now(), name: "", agency: "" }],

      // Schedule rows now carry the same morning/afternoon time fields
      // as EventCreatePage instead of a plain "hours" value.
      schedules: props.schedule?.schedules?.map((schedule, index) => ({
        id: schedule.id || `${props.schedule.scheduleId}-${index}`,
        rawDate: schedule.rawDate || null,
        date: schedule.date || "—",
        morning_in: schedule.morning_in || null,
        morning_out: schedule.morning_out || null,
        afternoon_in: schedule.afternoon_in || null,
        afternoon_out: schedule.afternoon_out || null,
      })) || [],

      departments: props.schedule?.departments || [],
      employees: props.schedule?.employees || [],
    });

    // =========================================================
    // TITLE-DEPENDENT LOOKUPS (venue / category / type / mode)
    // Same filter pattern as EventCreatePage.
    // =========================================================
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

    // =========================================================
    // SPEAKERS
    // =========================================================
    function addSpeaker() {
      eventForm.value.speakers.push({
        id: Date.now() + Math.random(),
        name: "",
        agency: "",
        position: "",
      });
    }

    function removeSpeaker(index) {
      eventForm.value.speakers.splice(index, 1);
    }

    // =========================================================
    // TIME HELPERS (same as EventCreatePage)
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

    // =========================================================
    // SCHEDULE DATE DIALOG
    // =========================================================
    const showDateDialog = ref(false);
    const selectedDates = ref([]);

    function openDateDialog() {
      selectedDates.value = eventForm.value.schedules
        .map((schedule) => schedule.rawDate)
        .filter(Boolean);
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
          // Default to 08:00 - 17:00, same as EventCreatePage
          morning_in: existing?.morning_in || "08:00",
          morning_out: existing?.morning_out || "12:00",
          afternoon_in: existing?.afternoon_in || "13:00",
          afternoon_out: existing?.afternoon_out || "17:00",
        };
      });

      showDateDialog.value = false;
    }

    function removeScheduleRow(index) {
      eventForm.value.schedules.splice(index, 1);
    }

    const selectedDateRange = computed(() => {
      const schedules = eventForm.value.schedules;
      if (!schedules.length) return "";

      const dates = schedules.map((schedule) => schedule.rawDate).filter(Boolean).sort();

      if (!dates.length) {
        return schedules[0]?.date || "";
      }
      if (dates.length === 1) {
        return formatDate(dates[0]);
      }

      return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
    });

    // =========================================================
    // DEPARTMENT TABLE (MAIN)
    // =========================================================
    const departmentSearch = ref("");
    const departmentPagination = ref({
      sortBy: "name",
      descending: false,
      rowsPerPage: 5,
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
      if (!search) return eventForm.value.departments;

      return eventForm.value.departments.filter((department) =>
        department.name.toLowerCase().includes(search)
      );
    });

    const totalAttendees = computed(() => {
      return eventForm.value.departments.reduce((total, department) => {
        return total + Number(department.attendees || 0);
      }, 0);
    });

    function removeDepartment(index) {
      const [removedDepartment] = eventForm.value.departments.splice(index, 1);
      const removedOfficeName = removedDepartment?.name;

      if (!removedOfficeName) return;

      eventForm.value.employees = eventForm.value.employees.filter(
        (employee) => employee.office !== removedOfficeName
      );
      delete selectedEmployeesByOffice.value[removedOfficeName];
    }

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

    const showDepartmentDialog = ref(false);
    const dialogTab = ref("department");

    const initializeSelectedOffices = (offices) => {
      return offices.map((office) => ({
        ...office,
        _attendees: office._attendees || 0,
      }));
    };

    const filteredOffices = computed(() => {
      const offices = officeStore.offices.map((office) => {
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

    watch(
      selectedOffices,
      (newVal) => {
        newVal.forEach((office) => {
          if (
            office._attendees === undefined ||
            office._attendees === null ||
            isNaN(office._attendees)
          ) {
            office._attendees = 0;
          }
        });
      },
      { deep: true }
    );

    function selectAllOffices() {
      const merged = filteredOffices.value.map((office) => {
        const existing = selectedOffices.value.find(
          (o) => o.officeId === office.officeId
        );
        return {
          ...office,
          _attendees: existing?._attendees ?? office._attendees ?? 0,
        };
      });

      const outsideFilter = selectedOffices.value.filter(
        (selected) =>
          !filteredOffices.value.some(
            (office) => office.officeId === selected.officeId
          )
      );

      selectedOffices.value = initializeSelectedOffices([...outsideFilter, ...merged]);
    }

    function clearAllOffices() {
      selectedOffices.value = [];
    }

    // =========================================================
    // EMPLOYEE SUGGESTIONS (per selected office)
    // =========================================================
    const showEmployeeRecordDialog = ref(false);
    const selectedEmployeeRecord = ref(null);

    function openEmployeeRecordDialog(employee) {
      selectedEmployeeRecord.value = employee;
      showEmployeeRecordDialog.value = true;
    }

    const activeEmployeeOffice = ref(null);
    const employeeSearch = ref("");

    const employeeTablePagination = ref({
      sortBy: "employee_name",
      descending: false,
      rowsPerPage: 10,
      page: 1,
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
        label: "trainingsAttended",
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
        name: "Action",
        label: "Action",
        field: "action",
        align: "center",
        sortable: true,
        style: "min-width: 90px;",
      },
    ];

    // Options built from the offices already selected in the Department tab
    const departmentOfficeOptions = computed(() =>
      selectedOffices.value.map((office) => ({
        label: office.office_name,
        value: office.office_name,
      }))
    );

    // Per-office "basket" of chosen employees
    const selectedEmployeesByOffice = ref({});
    const allSelectedEmployees = computed(() =>
      Object.values(selectedEmployeesByOffice.value).flat()
    );

    async function onOfficeChangeForEmployees(officeName) {
      employeeSearch.value = "";
      if (!officeName) return;
      if (!selectedEmployeesByOffice.value[officeName]) {
        selectedEmployeesByOffice.value[officeName] = [];
      }
      await eventStore.fetchSuggested(officeName, eventForm.value.venue_name);
    }

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

    const filteredSuggestedEmployees = computed(() => {
      const search = employeeSearch.value?.toLowerCase().trim();
      if (!search) return eventStore.employees;

      return eventStore.employees.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(search) ||
          emp.position?.toLowerCase().includes(search)
      );
    });

    function selectAllEmployeesForOffice() {
      currentOfficeSelectedEmployees.value = [...filteredSuggestedEmployees.value];
    }

    function clearAllEmployeesForOffice() {
      currentOfficeSelectedEmployees.value = [];
    }

    // Reset the active employee office if it was removed from the
    // Department selection, and drop its saved employee basket too.
    watch(selectedOffices, (newVal) => {
      const selectedOfficeNames = new Set(
        newVal.map((office) => office.office_name)
      );

      Object.keys(selectedEmployeesByOffice.value).forEach((officeName) => {
        if (!selectedOfficeNames.has(officeName)) {
          delete selectedEmployeesByOffice.value[officeName];
        }
      });

      if (
        activeEmployeeOffice.value &&
        !selectedOfficeNames.has(activeEmployeeOffice.value)
      ) {
        activeEmployeeOffice.value = null;
      }
    }, { deep: true });

    // "View Selected Employees" dialog (per department, main table)
    const showDepartmentEmployeesDialog = ref(false);
    const viewingDepartment = ref(null);

    function openDepartmentEmployeesDialog(department) {
      viewingDepartment.value = department;
      showDepartmentEmployeesDialog.value = true;
    }

    // function openDepartmentDialog() {
    //   officeSearch.value = "";
    //   bulkAttendeeCount.value = null;

    //   const existingOfficeIds = eventForm.value.departments.map((d) => d.id);
    //   const preselectedOffices = officeStore.offices
    //     .filter((office) => existingOfficeIds.includes(office.officeId))
    //     .map((office) => {
    //       const existingDept = eventForm.value.departments.find(
    //         (d) => d.id === office.office_name
    //       );
    //       return {
    //         ...office,
    //         _attendees: existingDept?.attendees || 0,
    //       };
    //     });

    //   selectedOffices.value = initializeSelectedOffices(preselectedOffices);
    //   showDepartmentDialog.value = true;
    // }
  function openDepartmentDialog() {
  officeSearch.value = "";
  bulkAttendeeCount.value = null;

  const existingDeptNames = eventForm.value.departments.map((d) => d.name);
  const preselectedOffices = officeStore.offices
    .filter((office) => existingDeptNames.includes(office.office_name))
    .map((office) => {
      const existingDept = eventForm.value.departments.find(
        (d) => d.name === office.office_name
      );
      return { ...office, _attendees: existingDept?.attendees || 0 };
    });

  selectedOffices.value = initializeSelectedOffices(preselectedOffices);

  // 👇 seed employee basket per office galing sa existing data
  const grouped = {};
  (eventForm.value.employees || []).forEach((emp) => {
    if (!emp.office) return;
    if (!grouped[emp.office]) grouped[emp.office] = [];
    grouped[emp.office].push({
      ControlNo: emp.control_no,
      name: emp.name,
      position: emp.position,
      status: emp.status,
    });
  });
  selectedEmployeesByOffice.value = grouped;

  showDepartmentDialog.value = true;
}

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
      if (selectedOffices.value.length === 0 || bulkAttendeeCount.value === null) {
        return;
      }

      const count = Number(bulkAttendeeCount.value);
      selectedOffices.value.forEach((office) => {
        office._attendees = isNaN(count) ? 0 : count;
      });

      $q.notify({
        type: "positive",
        message: `Applied ${count} attendee${count > 1 ? "s" : ""} to ${
          selectedOffices.value.length
        } department(s).`,
        position: "top",
        timeout: 1500,
      });
    }

    function addSelectedDepartments() {
      eventForm.value.departments = selectedOffices.value.map((office) => ({
        id: office.officeId,
        name: office.office_name,
        attendees: Number(office._attendees) || 0,
        employees: (selectedEmployeesByOffice.value[office.office_name] || []).map(
          (emp) => ({
            control_no: emp.ControlNo,
            name: emp.name,
            position: emp.position,
            status: emp.status,
          })
        ),
      }));

      // Flat list of every selected employee across all offices — this
      // is what goes into the save payload.
      eventForm.value.employees = selectedOffices.value.flatMap((office) =>
        (selectedEmployeesByOffice.value[office.office_name] || []).map((emp) => ({
            control_no: emp.ControlNo,
            name: emp.name,
            position: emp.position,
            office: office.office_name,
            status: emp.status,
          }))
      );

      showDepartmentDialog.value = false;

      if (selectedOffices.value.length > 0) {
        $q.notify({
          type: "positive",
          message: `${selectedOffices.value.length} department(s) added successfully.`,
          position: "top",
          timeout: 2000,
        });
      }
    }

    // =========================================================
    // SAVE (Add or Edit — same payload shape as EventCreatePage)
    // =========================================================
    async function save() {
      errorMessage.value = "";

      if (!eventForm.value.schedules.length) {
        $q.notify({
          type: "warning",
          message: "Please add at least one schedule date.",
          position: "top",
        });
        return;
      }

      const payload = {
        venue_name: eventForm.value.venue_name,
        category_name: eventForm.value.category_name,
        type_name: eventForm.value.type_name,
        mode_name: eventForm.value.mode_name,
        conducted_by: eventForm.value.conducted_by,
        source_name: eventForm.value.source_name,
        hours: eventForm.value.hours,
        qualifications: eventForm.value.qualifications || null,
        fee: eventForm.value.fee,

        speaker: eventForm.value.speakers
          .filter((speaker) => speaker.name.trim())
          .map((speaker) => ({
            speaker_name: speaker.name,
            agency: speaker.agency,
            position: speaker.position,
          })),

        office: eventForm.value.departments.map((department) => ({
          office_name: department.name,
          attendees: Number(department.attendees) || 0,
        })),

        employee: eventForm.value.employees,

        DateTime: eventForm.value.schedules.map((schedule) => ({
          schedule_date: schedule.rawDate,
          morning_in: formatTimeDisplay(schedule.morning_in),
          morning_out: formatTimeDisplay(schedule.morning_out),
          afternoon_in: formatTimeDisplay(schedule.afternoon_in),
          afternoon_out: formatTimeDisplay(schedule.afternoon_out),
        })),

        ...buildCompetenciesPayload(eventForm.value.competencies),
      };

      saving.value = true;

      try {
        const result = isEditing.value
          ? await scheduleStore.updateSchedule(props.schedule.scheduleId, payload)
          : await scheduleStore.addSchedule(props.eventId, payload);

        if (!result?.success) {
          throw new Error(result?.message || "Unable to save schedule.");
        }

        $q.notify({
          type: "positive",
          message: result.message || "Schedule saved successfully.",
          position: "top",
        });

        emit("saved");
      } catch (error) {
        console.error(error);
        errorMessage.value = error?.message || "Unable to save schedule.";
        $q.notify({
          type: "negative",
          message: errorMessage.value,
          position: "top",
        });
      } finally {
        saving.value = false;
      }
    }
   const interventionOptions = [
      { label: "Formal Learning", value: "Formal Learning" },
      { label: "Experiential Learning", value: "Experiential Learning" },
      { label: "Social Learning", value: "Social Learning" },
      // { label: "Self-Directed Learning", value: "Self-Directed Learning" },
    ];
    // =========================================================
    // LOAD OFFICES (needed for Department dialog)
    // =========================================================
    onMounted(async () => {
      try {
        await officeStore.fetchOffices();
      } catch (error) {
        console.error("Failed to load offices:", error);
        $q.notify({
          type: "negative",
          message: "Failed to load departments. Please refresh the page.",
          position: "top",
        });
      }
    });

    return {
      officeStore,
      isEditing,
      saving,
      errorMessage,
      activeTab,
      eventForm,
      sourceOptions,

      // library options
      venueOptions,
      venueLoading,
      filterVenues,
      onVenuesInput,

      categoryOptions,
      categoryLoading,
      filterCategory,
      onCategoryInput,

      typeOptions,
      typeLoading,
      filterType,
      onTypeInput,

      modeOptions,
      modeLoading,
      filterModes,
      onModesInput,

      // competencies
      coreOptions,
      technicalOptions,
      leadershipOptions,

      // Speakers
      addSpeaker,
      removeSpeaker,

      // Schedule date
      showDateDialog,
      selectedDates,
      openDateDialog,
      applyDates,
      removeScheduleRow,
      selectedDateRange,
      formatTimeDisplay,

      // Department table (main)
      departmentSearch,
      filteredDepartments,
      departmentColumns,
      departmentPagination,
      totalAttendees,
      removeDepartment,

      // Office table (dialog)
      officeSearch,
      selectedOffices,
      bulkAttendeeCount,
      officePagination,
      officeColumns,
      showDepartmentDialog,
      filteredOffices,
      selectAllOffices,
      clearAllOffices,
      openDepartmentDialog,
      updateAttendeeValue,
      applyBulkAttendees,
      addSelectedDepartments,
      eventStore,

      // Department dialog tabs
      dialogTab,

      // Employee suggestions
      activeEmployeeOffice,
      employeeTablePagination,
      employeeColumns,
      departmentOfficeOptions,
      currentOfficeSelectedEmployees,
      allSelectedEmployees,
      selectAllEmployeesForOffice,
      clearAllEmployeesForOffice,
      onOfficeChangeForEmployees,
      employeeSearch,
      filteredSuggestedEmployees,

      showEmployeeRecordDialog,
      selectedEmployeeRecord,
      openEmployeeRecordDialog,

      // View selected employees per department
      showDepartmentEmployeesDialog,
      viewingDepartment,
      openDepartmentEmployeesDialog,

      // Save
      save,
      interventionOptions
    };
  },
});
</script>

<style scoped>
/* =========================================================
   FORM HEADER
========================================================= */
.form-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.back-btn {
  color: #333333;
}

.section-title {
  margin-bottom: 5px;
  color: #222222;
  font-size: 13px;
  font-weight: 650;
}

.form-title {
  margin-bottom: 0;
}

.forms-title {
  margin-bottom: 9px;
}

.error-banner {
  margin-bottom: 14px;
  font-size: 12px;
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

.section-divider {
  height: 1px;
  margin: 10px 0;
  background: #cccccc;
}

.two-column-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 10px;
}

.source-hint {
  color: #666666;
  font-size: 11px;
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
   COMPETENCY
========================================================= */
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
  grid-template-columns: minmax(130px, 1fr) minmax(200px, 1.4fr) 65px;
  align-items: center;
}

.schedule-table-header {
  min-height: 31px;
  padding: 0 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #cccccc;
  color: #a0a0a0;
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

.action-column {
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  color: #999999;
}

.delete-btn:hover {
  color: #d83d3d;
}

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
   DEPARTMENT SECTION
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
   DEPARTMENT TABLE
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

/* =========================================================
   EMPTY STATE
========================================================= */
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

.empty-state .q-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

/* =========================================================
   PAGE ACTIONS
========================================================= */
.page-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  color: #777777;
  font-size: 11px;
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

.create-btn:hover {
  background: #16a844;
}

/* =========================================================
   DIALOGS
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
  background: transparent;
}

.dialog-tab-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px 20px;
  overflow: hidden;
}

.action-btn-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.employee-search-spacing {
  margin-top: 14px;
}

.trained-row {
  background-color: #fdecea;
}

.trained-row :deep(td) {
  color: #c62828;
}

/* =========================================================
   EMPLOYEE RECORD DIALOG
========================================================= */
.employee-record-dialog {
  width: 700px;
  max-width: 92vw;
  border-radius: 13px;
}

.employee-record-body {
  padding: 18px;
  max-height: 60vh;
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
  font-size: 11px;
  background: #f5f5f5;
}

.record-table :deep(td) {
  font-size: 11px;
}

.record-empty {
  padding: 16px;
  text-align: center;
  color: #aaaaaa;
  font-size: 12px;
  border: 1px dashed #e0e0e0;
  border-radius: 6px;
}

/* =========================================================
   DEPARTMENT EMPLOYEES VIEW DIALOG
========================================================= */
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

.loading-state > div {
  margin-top: 10px;
}

.no-data-state {
  padding: 40px;
  text-align: center;
  color: #b0b0b0;
}

.no-data-state > div {
  margin-top: 8px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 650px) {
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

  .competency-grid {
    grid-template-columns: 1fr;
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
    grid-template-columns: 1fr 1fr 40px;
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

  .page-actions {
    justify-content: stretch;
  }

  .page-actions .cancel-btn,
  .page-actions .create-btn {
    flex: 1;
  }

  .department-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .add-department-wrapper {
    width: 100%;
  }

  .add-department-btn {
    width: 100%;
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
}
</style>

<template>
  <q-page class="event-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <q-btn flat dense no-caps icon="arrow_back" label="Back to Events" class="back-btn" @click="$router.back()" />
        <h5>Event Schedule Details</h5>
        <p>Full details of this training schedule, tagged employees, and nomination.</p>
      </div>
    </section>

    <!-- ===================================================
         LOADING / ERROR
    ==================================================== -->
    <LoadingState v-if="loading" message="Loading schedule details..." full-page />
    <div v-else-if="errorMessage" class="error-state">{{ errorMessage }}</div>

    <template v-else>
      <!-- ===================================================
           1. SCHEDULE DETAILS
      ==================================================== -->
      <q-card flat bordered class="detail-card">
        <div class="section-head">
          <span class="section-badge">1</span>
          <div class="section-head-text">
            <div class="section-title">Schedule Details</div>
            <div class="section-sub">Event and schedule information</div>
          </div>
          <span class="status-badge" :class="'status-' + schedule.computedStatus">
            {{ schedule.computedStatus }}
          </span>
        </div>

        <div class="detail-body">
          <h6 class="event-title-lg">{{ eventInfo.title_name }}</h6>
          <!-- <div class="event-sub">Created {{ eventInfo.created_at }}</div> -->

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Venue</span>
              <span class="detail-value">{{ schedule.venue_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mode</span>
              <span class="detail-value">{{ schedule.mode_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Hours</span>
              <span class="detail-value">{{ schedule.hours }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Fee</span>
              <span class="detail-value">{{ schedule.fee }}</span>
            </div>
            <!-- <div class="detail-item">
              <span class="detail-label">Qualifications</span>
              <span class="detail-value">{{ schedule.qualifications }}</span>
            </div> -->
            <div class="detail-item">
              <span class="detail-label">Type</span>
              <span class="detail-value">{{ schedule.type_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Category</span>
              <span class="detail-value">{{ schedule.category_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Source</span>
              <span class="detail-value">{{ schedule.source_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Conducted by</span>
              <span class="detail-value">{{ schedule.conducted_by || "—" }}</span>
            </div>
            <!-- <div class="detail-item" v-if="offices.length">
              <span class="detail-label">Office</span>
              <span class="detail-value">{{ offices.join(", ") }}</span>
            </div> -->
            <div class="detail-item">
              <span class="detail-label">Qualifications</span>
              <span class="detail-value">{{ schedule.qualifications }}</span>
            </div>

          </div>

          <div class="section-label">Schedule Dates</div>
          <div class="date-list">
            <div v-for="d in scheduleDates" :key="d.id" class="date-item">
              <strong>{{ d.schedule_date }}</strong>
              <span>
                {{ d.morning_in }}–{{ d.morning_out }} ·
                {{ d.afternoon_in }}–{{ d.afternoon_out }}
              </span>
            </div>
            <div v-if="!scheduleDates.length" class="table-empty">
              No schedule dates.
            </div>
          </div>

          <template v-if="speakers.length">
            <div class="section-label">Speakers</div>
            <div class="speaker-list">
              <div v-for="sp in speakers" :key="sp.speakerId" class="speaker-item">
                <strong>{{ sp.speaker_name }}</strong> — {{ sp.position }}, {{ sp.agency }}
              </div>
            </div>
          </template>

          <template v-if="competencyGroups.length">
            <div class="section-label">Competencies</div>
            <div class="competency-groups">
              <div v-for="group in competencyGroups" :key="group.key" class="competency-group-block"
                :class="'competency-' + group.color">
                <div class="competency-group-title">{{ group.label }}</div>
                <div class="tag-row">
                  <span v-for="(item, i) in group.items" :key="i" class="tag">
                    {{ item }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </q-card>

      <!-- ===================================================
           2. TAGGED EMPLOYEES
      ==================================================== -->
      <q-card flat bordered class="detail-card">
        <div class="section-head">
          <span class="section-badge">2</span>
          <div class="section-head-text">
            <div class="section-title">Qualified Employees for this Event</div>
            <div class="section-sub"> Employees who are qualified and tagged by HRM for this event.</div>
          </div>
        </div>

        <q-table flat :rows="employeeTags" :columns="employeeTagColumns" row-key="id"
          :rows-per-page-options="[0, 5, 10, 20, 50, 100]" class="detail-table">
          <template #no-data>
            <div class="table-empty">No tagged employees.</div>
          </template>
        </q-table>
      </q-card>

    </template>
    <!-- ===================================================
     3. NOMINATION
==================================================== -->
    <q-card flat bordered class="detail-card">
      <div class="section-head">
        <span class="section-badge">3</span>
        <div class="section-head-text">
          <div class="section-title">Nomination</div>
          <div class="section-sub">Select employees to nominate for this schedule</div>
        </div>
        <q-btn no-caps unelevated icon="add" label="Nominate Employees" class="nominate-btn"
          @click="openNominationDialog" />
      </div>

      <div class="detail-body" v-if="!nominatedEmployees.length">
        <div class="table-empty">No nominations yet for this schedule.</div>
      </div>
      <q-table v-else flat :rows="nominatedEmployees" :columns="nominatedColumns" row-key="nominated_employee_id"
        :rows-per-page-options="[0, 10, 20, 50, 100]" class="detail-table">
        <template #body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'is_attended'">
                <q-badge :color="props.row.is_attended ? 'green' : 'grey-6'">
                  {{ props.row.is_attended ? 'Yes' : 'No' }}
                </q-badge>
              </template>
              <template v-else-if="col.name === 'nominate_status'">
                <q-badge
                  :color="props.row.nominate_status === 'approved' ? 'green' : (props.row.nominate_status === 'rejected' ? 'red' : 'orange')">
                  {{ props.row.nominate_status || 'Pending' }}
                </q-badge>
              </template>
              <!-- ✅ NEW: truncated reason with tooltip -->
              <template v-else-if="col.name === 'nominate_reason'">
                <span class="reason-cell">
                  {{ truncateText(props.row.nominate_reason, 24) }}
                  <q-tooltip max-width="300px" class="reason-tooltip">
                    {{ props.row.nominate_reason }}
                  </q-tooltip>
                </span>
              </template>
              <template v-else-if="col.name === 'action'">
                <div class="row-actions">
                  <q-btn flat dense round icon="visibility" color="primary"
                    @click.stop="viewNominationDetails(props.row)">
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>

                  <q-btn flat dense round icon="edit" color="orange" @click.stop="openEditReasonDialog(props.row)">
                    <q-tooltip>Edit Reason</q-tooltip>
                  </q-btn>

                  <q-btn flat dense round icon="delete" color="negative"
                    @click.stop="deleteNominatedEmployee(props.row)">
                    <q-tooltip>Remove Nomination</q-tooltip>
                  </q-btn>
                </div>
              </template>
              <template v-else>
                {{ col.value }}
              </template>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================
     NOMINATION DIALOG — 3 STEPS
====================================================== -->
    <q-dialog v-model="showNominationDialog" persistent>
      <q-card class="nomination-dialog">
        <q-card-section class="dialog-header">
          <div class="section-title">Nominate Employees</div>
          <div class="section-sub">{{ eventInfo.title_name }}</div>
        </q-card-section>

        <q-separator />

        <q-stepper v-model="nominationStep" ref="nominationStepper" color="green" animated flat header-nav
          class="nomination-stepper">
          <!-- STEP 1: SELECT EMPLOYEES -->
          <q-step :name="1" title="Select Employees" icon="group" :done="nominationStep > 1">
            <q-input v-model="employeeSearch" outlined dense clearable placeholder="Search employees..."
              class="office-search">
              <template #prepend><q-icon name="search" /></template>
            </q-input>

            <q-table flat bordered class="offices-table" :rows="filteredNominationEmployees" :columns="employeeColumns"
              row-key="ControlNo" :loading="employeeStore.loading" selection="multiple"
              v-model:selected="selectedNominees" :rows-per-page-options="[5, 10, 25, 50]">
              <template #body="props">
                <q-tr :props="props" :class="{ 'trained-row': props.row.isAlreadyTrained }">
                  <q-td auto-width>
                    <q-checkbox v-model="props.selected" />
                  </q-td>
                  <q-td v-for="col in props.cols" :key="col.name" :props="props">
                    <template v-if="col.name === 'isAlreadyTrained'">
                      <q-badge :color="props.row.isAlreadyTrained ? 'red' : 'green'">
                        {{ props.row.isAlreadyTrained ? 'Trained' : 'Not Trained' }}
                      </q-badge>
                    </template>
                    <template v-else-if="col.name === 'action'">
                      <q-btn flat dense round icon="visibility" color="primary"
                        @click.stop="viewEmployeeRecord(props.row)">
                        <q-tooltip>View Records</q-tooltip>
                      </q-btn>
                    </template>
                    <template v-else>
                      {{ col.value }}
                    </template>
                  </q-td>
                </q-tr>
              </template>

              <template #no-data>
                <div class="no-data-state">
                  <q-icon name="person" size="40px" color="grey-4" />
                  <div>No employees found for this event title.</div>
                </div>
              </template>
            </q-table>
          </q-step>
          <!-- STEP 2: REASON PER EMPLOYEE -->
          <q-step :name="2" title="Nomination Reason" icon="edit_note" :done="nominationStep > 2">
            <div v-if="!selectedNominees.length" class="empty-state">
              <q-icon name="info" size="28px" color="grey-4" />
              <div>Walang napiling employee sa Step 1.</div>
            </div>

            <q-table v-else flat bordered :rows="selectedNominees" :columns="reasonColumns" row-key="ControlNo"
              :rows-per-page-options="[0, 5, 10, 20, 50, 100]" class="offices-table">
              <template #body="props">
                <q-tr :props="props">
                  <q-td v-for="col in props.cols" :key="col.name" :props="props">
                    <template v-if="col.name === 'nominate_reason'">
                      <q-input v-model="nominationReasons[props.row.ControlNo]" dense outlined type="textarea" autogrow
                        placeholder="Reason for nominating..." />
                    </template>
                    <template v-else>
                      {{ col.value }}
                    </template>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-step>

          <!-- STEP 3: CONFIRMATION -->
          <q-step :name="3" title="Confirmation" icon="fact_check">
            <q-table flat bordered :rows="confirmationRows" :columns="confirmationColumns" row-key="control_no"
              :rows-per-page-options="[0, 5, 10, 20, 50, 100]" class="offices-table" />
          </q-step>

          <template #navigation>
            <q-stepper-navigation class="dialog-actions">
              <q-space />
              <q-btn v-if="nominationStep > 1" flat no-caps label="Back" @click="$refs.nominationStepper.previous()" />
              <q-btn no-caps label="Cancel" v-close-popup color="red" @click="resetNominationDialog" />
              <q-btn v-if="nominationStep < 3" unelevated no-caps label="Next" color="green"
                :disable="nominationStep === 1 && !selectedNominees.length" @click="goToNextStep" />
              <q-btn v-else unelevated no-caps label="Confirm & Nominate" class="save-dialog-btn" color="green"
                :loading="employeeStore.loading" @click="submitNomination" />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEmployeeRecordDialog">
      <q-card style="width: 600px; max-width: 90vw;">
        <q-card-section class="dialog-header">
          <div class="section-title">{{ viewedEmployee?.name }}</div>
          <div class="section-sub">
            {{ viewedEmployee?.position }} — {{ viewedEmployee?.office }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Control No.</span>
              <span class="detail-value">{{ viewedEmployee?.ControlNo }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Training Count</span>
              <span class="detail-value">{{ viewedEmployee?.trainingCount }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Already Trained</span>
              <span class="detail-value">{{ viewedEmployee?.isAlreadyTrained ? "Yes" : "No" }}</span>
            </div>
          </div>

          <div class="section-label" v-if="viewedEmployee?.x_training?.length">
            Training History
          </div>
          <q-table v-if="viewedEmployee?.x_training?.length" flat bordered dense :rows="viewedEmployee.x_training"
            :columns="trainingColumns" row-key="training" hide-pagination :rows-per-page-options="[0]" />
          <div v-else class="table-empty">No training history yet.</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat no-caps label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showNominationDetailsDialog">
      <q-card style="width: 500px; max-width: 90vw;">
        <q-card-section class="dialog-header">
          <div class="section-title">{{ viewedNomination?.full_name }}</div>
          <div class="section-sub">
            {{ viewedNomination?.designation }} — {{ viewedNomination?.office }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Control No.</span>
              <span class="detail-value">{{ viewedNomination?.control_no }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-value">{{ viewedNomination?.status }}</span>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
              <span class="detail-label">Reason</span>
              <span class="detail-value">{{ viewedNomination?.nominate_reason || "—" }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat no-caps label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showEditReasonDialog">
      <q-card style="width: 480px; max-width: 90vw;">
        <q-card-section class="dialog-header">
          <div class="section-title">Edit Nomination Reason</div>
          <div class="section-sub">{{ editingReasonRow?.full_name }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input v-model="editReasonText" outlined type="textarea" autogrow dense
            placeholder="Reason for nominating..." :rules="[val => !!val?.trim() || 'Reason is required']" />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" v-close-popup />
          <q-btn unelevated no-caps label="Save" color="green" class="save-dialog-btn" :loading="employeeStore.loading"
            @click="saveEditedReason" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>import { defineComponent, computed, onMounted, ref, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import { Notify } from "quasar";

import { useOfficeEventStore } from "src/stores/office/event/eventStore";
import { useEmployeeStore } from "src/stores/office/event/employeeStore";
import LoadingState from "src/components/LoadingStatePage.vue";
import Swal from "sweetalert2";

export default defineComponent({
  name: "EventViewPage",
  components: { LoadingState }, 

  setup() {
    const officeEventStore = useOfficeEventStore();
    const employeeStore = useEmployeeStore();
    const route = useRoute();

    const scheduleId = route.params.scheduleId;

    const loading = ref(true);
    const errorMessage = ref("");
    const eventDetail = ref(null);

    const schedule = computed(() => eventDetail.value || {});
    const eventInfo = computed(() => schedule.value.event || {});
    const scheduleDates = computed(() => schedule.value.schedule_date_time || []);
    const offices = computed(() =>
      (schedule.value.office || []).map((o) => o.office_name)
    );
    const speakers = computed(() => schedule.value.speaker || []);
    const employeeTags = computed(() => schedule.value.employee_tag || []);

    const showEmployeeRecordDialog = ref(false);
    const viewedEmployee = ref(null);

    const employeeColumns = [
      { name: "ControlNo", label: "Control No.", field: "ControlNo", align: "left" },
      { name: "name", label: "Name", field: "name", align: "left" },
      // { name: "office", label: "Office", field: "office", align: "left" },
      { name: "position", label: "Position", field: "position", align: "left" },
      // { name: "isAlreadyTrained", label: "Status", field: "isAlreadyTrained", align: "center" },
      { name: "status", label: "Status", field: "status", align: "center" },
      { name: "action", label: "", field: "action", align: "center" },
    ];

    const employeeTagColumns = [
      { name: "ControlNo", label: "Control No.", field: "control_no", align: "left" },
      { name: "name", label: "Name", field: "name", align: "left" },
      // { name: "office", label: "Office", field: "office", align: "left" },
      { name: "position", label: "Position", field: "position", align: "left" },
      // { name: "isAlreadyTrained", label: "Status", field: "isAlreadyTrained", align: "center" },
      { name: "status", label: "Status", field: "status", align: "center" },
      { name: "action", label: "", field: "action", align: "center" },
    ];
    const trainingColumns = [
      { name: "training", label: "Training", field: "training", align: "left" },
      { name: "DateFrom", label: "Date From", field: "DateFrom", align: "left" },
      { name: "DateTo", label: "Date To", field: "DateTo", align: "left" },
      { name: "NumHours", label: "Hours", field: "NumHours", align: "left" },
      { name: "Conductor", label: "Conducted By", field: "Conductor", align: "left" },
      { name: "Type", label: "Type", field: "Type", align: "left" },
    ];

    const reasonColumns = [
      { name: "ControlNo", label: "Control No.", field: "ControlNo", align: "left" },
      { name: "name", label: "Name", field: "name", align: "left" },
      { name: "position", label: "Position", field: "position", align: "left" },
      { name: "status", label: "Status", field: "status", align: "left" },
      // { name: "office", label: "Office", field: "office", align: "left" },
      { name: "nominate_reason", label: "Reason", field: "nominate_reason", align: "left" },
    ];
    function viewEmployeeRecord(emp) {
      viewedEmployee.value = emp;
      showEmployeeRecordDialog.value = true;
    }
    function labelize(key) {
      return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const competencyGroups = computed(() => {
      const groups = [
        { key: "event_core", label: "Core Competencies", color: "core" },
        { key: "event_technical", label: "Technical Competencies", color: "technical" },
        { key: "event_leadership", label: "Leadership Competencies", color: "leadership" },
      ];

      return groups
        .map((group) => {
          const entry = schedule.value[group.key]?.[0] || {};
          const items = Object.entries(entry)
            .filter(([field, value]) => value === true)
            .map(([field]) => labelize(field));

          return { ...group, items };
        })
        .filter((group) => group.items.length); // itago yung grupo kung walang true values
    });
    async function loadSchedule() {
      loading.value = true;
      errorMessage.value = "";

      const result = await officeEventStore.view_office_event(scheduleId);

      if (result.success) {
        eventDetail.value = result.data;
      } else {
        errorMessage.value = result.message || "Failed to load schedule.";
      }

      loading.value = false;
    }

    // =====================================================
    // NOMINATION DIALOG — 3-step flow
    // =====================================================
    const showNominationDialog = ref(false);
    const nominationStep = ref(1);
    const employeeSearch = ref("");
    const selectedNominees = ref([]);          // Step 1 output
    const nominationReasons = reactive({});    // Step 2 output, keyed by control_no
    const nominatedList = ref([]);             // Step 3 result / summary after save

    const nominatedEmployees = computed(() => employeeStore.nominatedEmployee || []);

    async function loadNominatedEmployees() {
      await employeeStore.fetchEmployeeListNominated(scheduleId);
    }
    const nominatedColumns = [
      { name: "controlNo", label: "Control No.", field: "control_no", align: "left" },
      { name: "name", label: "Name", field: "full_name", align: "left" },
      // { name: "office", label: "Office", field: "office", align: "left" },
      { name: "designation", label: "Position", field: "designation", align: "left" },
      { name: "status", label: "Status", field: "status", align: "left" },
      { name: "nominate_reason", label: "Reason", field: "nominate_reason", align: "left", style: "max-width: 200px" },
      { name: "action", label: "Action", field: "action", align: "left" },
    ];
    function truncateText(text, maxLength = 24) {
      if (!text) return "—";
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength).trim() + "...";
    }

    const confirmationColumns = [
      { name: "ControlNo", label: "Control No.", field: "ControlNo", align: "left" },
      { name: "name", label: "Name", field: "name", align: "left" },
      { name: "position", label: "Position", field: "position", align: "left" },
      { name: "status", label: "Status", field: "status", align: "left" },
      { name: "nominate_reason", label: "Reason", field: "nominate_reason", align: "left" },
    ];

    const confirmationRows = computed(() =>
      selectedNominees.value.map((emp) => ({
        ...emp,
        nominate_reason: nominationReasons[emp.ControlNo] || "—",
      }))
    );

    const filteredNominationEmployees = computed(() => {
      const term = employeeSearch.value?.toLowerCase().trim();
      const list = employeeStore.employees || [];
      if (!term) return list;
      return list.filter((e) =>
        [e.name, e.ControlNo, e.office, e.position]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(term))
      );
    });

    async function openNominationDialog() {
      resetNominationDialog();
      showNominationDialog.value = true;
      await employeeStore.fetchEmployeeListNomination(eventInfo.value.title_name);
    }

    function resetNominationDialog() {
      nominationStep.value = 1;
      selectedNominees.value = [];
      Object.keys(nominationReasons).forEach((k) => delete nominationReasons[k]);
    }

    function goToNextStep() {
      if (nominationStep.value === 1 && !selectedNominees.value.length) return;
      nominationStep.value += 1;
    }

    // Prevent orphaned reasons if user goes back to Step 1 and unchecks someone
    // watch — orphan cleanup
    watch(selectedNominees, (newVal) => {
      const validControlNos = new Set(newVal.map((e) => e.ControlNo));
      Object.keys(nominationReasons).forEach((k) => {
        if (!validControlNos.has(k)) delete nominationReasons[k];
      });
    });

    async function submitNomination() {
      const missingReason = selectedNominees.value.find(
        (emp) => !nominationReasons[emp.ControlNo]?.trim()
      );
      if (missingReason) {
        Notify.create({
          type: "negative",
          message: `Please provide a reason for ${missingReason.name}.`,
        });
        nominationStep.value = 2;
        return;
      }

      const payload = {
        employee: selectedNominees.value.map((emp) => ({
          event_id: eventInfo.value.event_id,
          event_schedule_id: scheduleId,
          control_no: emp.ControlNo,
          nominate_reason: nominationReasons[emp.ControlNo],
        })),
      };

      const result = await employeeStore.storeNominateEmployee(payload);

      if (result.success) {
        Notify.create({ type: "positive", message: result.message });
        showNominationDialog.value = false;
        resetNominationDialog();
        await loadNominatedEmployees();   // ✅ i-refresh yung table matapos mag-nominate
      } else {
        Notify.create({ type: "negative", message: result.message });
      }
    }

    const showNominationDetailsDialog = ref(false);
    const viewedNomination = ref(null);

    function viewNominationDetails(row) {
      viewedNomination.value = row;
      showNominationDetailsDialog.value = true;
    }

    const showEditReasonDialog = ref(false);
    const editingReasonRow = ref(null);
    const editReasonText = ref("");

    function openEditReasonDialog(row) {
      editingReasonRow.value = row;
      editReasonText.value = row.nominate_reason || "";
      showEditReasonDialog.value = true;
    }

    async function saveEditedReason() {
      if (!editReasonText.value?.trim()) {
        Notify.create({
          type: "negative",
          message: "Reason is required.",
          position: "top", // ✅
        });
        return;
      }

      const result = await employeeStore.editEmployeeReason(
        editingReasonRow.value.nominated_employee_id,
        { nominate_reason: editReasonText.value.trim() }
      );

      if (result.success) {
        Notify.create({
          type: "positive",
          message: result.message,
          position: "top", // ✅
        });
        showEditReasonDialog.value = false;
        await loadNominatedEmployees();
      } else {
        Notify.create({
          type: "negative",
          message: result.message,
          position: "top", // ✅
        });
      }
    }
    function deleteNominatedEmployee(row) {
      Swal.fire({
        title: "Remove Nomination",
        text: `Are you sure you want to remove ${row.full_name} from this nomination?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d83d3d",
        cancelButtonColor: "#9e9e9e",
        reverseButtons: true,
        scrollbarPadding: false,
        heightAuto: false,
      }).then(async (result) => {
        if (!result.isConfirmed) return;

        try {
          const deleteResult = await employeeStore.deleteEmployeeNominated(row.nominated_employee_id);

          if (deleteResult?.success) {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Nomination removed successfully.",
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true,
              scrollbarPadding: false,
            });
            await loadNominatedEmployees(); // i-refresh yung table
          } else {
            Swal.fire({
              title: "Failed",
              text: deleteResult?.message || "Unable to remove nomination.",
              icon: "error",
              scrollbarPadding: false,
            });
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error",
            text: error?.message || "Unable to remove nomination.",
            icon: "error",
            scrollbarPadding: false,
          });
        }
      });
    }

    onMounted(async () => {
      await loadSchedule();
      await loadNominatedEmployees();
    });

    return {
      officeEventStore,
      employeeStore,
      loading,
      errorMessage,

      schedule,
      eventInfo,
      scheduleDates,
      offices,
      speakers,
      employeeTags,
      employeeColumns,
      competencyGroups,
      employeeTagColumns,

      showNominationDialog,
      nominationStep,
      employeeSearch,
      selectedNominees,
      nominationReasons,
      nominatedList,
      confirmationColumns,
      confirmationRows,
      filteredNominationEmployees,
      openNominationDialog,
      resetNominationDialog,
      goToNextStep,
      submitNomination,


      reasonColumns,
      showEmployeeRecordDialog,
      viewedEmployee,
      trainingColumns,
      viewEmployeeRecord,

      nominatedEmployees,
      nominatedColumns,

      // actions
      deleteNominatedEmployee,

      // function helper 
      truncateText,
      // dialog 
      showNominationDetailsDialog,
      viewedNomination,
      viewNominationDetails,

      showEditReasonDialog,
      editingReasonRow,
      editReasonText,
      openEditReasonDialog,
      saveEditedReason,

    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.event-page {
  min-height: 100%;
  padding: 20px;
  color: #19354a;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* =========================================================
   PAGE HEADER
========================================================= */

.page-header {
  margin-bottom: 4px;
}

.back-btn {
  padding: 0;
  margin-bottom: 6px;
  color: #718089;
  font-size: 11px;
}

.page-header h5 {
  margin: 5px 0 3px;
  color: #19354a;
  font-size: 18px;
  font-weight: 750;
}

.page-header p {
  margin: 0;
  color: #718089;
  font-size: 12px;
}

/* =========================================================
   LOADING / ERROR
========================================================= */

.loading-state,
.table-empty {
  padding: 30px 0;
  text-align: center;
  color: #8a989e;
  font-size: 12px;
}

.error-state {
  padding: 20px;
  border-radius: 10px;
  background: #fbe9e9;
  color: #c73f3f;
  font-size: 12px;
}

/* =========================================================
   DETAIL CARD (shared shell for all 3 sections)
========================================================= */

.detail-card {
  overflow: hidden;
  border-radius: 13px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);

}

.section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
}

.section-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #19354a;
  color: #ffffff;
  font-size: 12px;
  font-weight: 750;
}

.section-head-text {
  flex: 1;
}

.section-title {
  color: #19354a;
  font-size: 13.5px;
  font-weight: 750;
}

.section-sub {
  margin-top: 2px;
  color: #8a989e;
  font-size: 10.5px;
}

/* =========================================================
   SECTION 1 — SCHEDULE DETAILS
========================================================= */

.detail-body {
  padding: 20px 22px;
}

.event-title-lg {
  margin: 0;
  color: #172431;
  font-size: 17px;
  font-weight: 750;
  line-height: 1.4;
}

.event-sub {
  margin-top: 4px;
  color: #94a3ab;
  font-size: 10.5px;
  font-style: italic;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
  margin-top: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eef2f1;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  color: #94a3ab;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.detail-value {
  color: #2c3e4a;
  font-size: 13px;
  font-weight: 550;
}

.section-label {
  margin: 22px 0 10px;
  color: #94a3ab;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* =========================================================
   COMPETENCY GROUPS — hiwalay na bawat category
========================================================= */
.competency-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.competency-group-block {
  padding: 12px 16px;
  border-radius: 10px;
  border-left: 3px solid transparent;
  background: #fafcfb;
}

.competency-group-title {
  margin-bottom: 9px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.competency-group-block .tag-row {
  margin-top: 0;
}

/* CORE — blue */
.competency-core {
  border-left-color: #2b6cb0;
}

.competency-core .competency-group-title {
  color: #2b6cb0;
}

.competency-core .tag {
  background: #e7f0fb;
  color: #2b6cb0;
}

/* TECHNICAL — purple */
.competency-technical {
  border-left-color: #7c3aed;
}

.competency-technical .competency-group-title {
  color: #7c3aed;
}

.competency-technical .tag {
  background: #f1e9fd;
  color: #7c3aed;
}

/* LEADERSHIP — orange/amber */
.competency-leadership {
  border-left-color: #d97706;
}

.competency-leadership .competency-group-title {
  color: #d97706;
}

.competency-leadership .tag {
  background: #fdf3e0;
  color: #d97706;
}

.date-list,
.speaker-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.date-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #eef2f1;
  background: #fafcfb;
  color: #2c3e4a;
  font-size: 12px;
}

.date-item strong {
  color: #172431;
}

.speaker-item {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #eef2f1;
  background: #fafcfb;
  color: #2c3e4a;
  font-size: 12px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 10px;
  border-radius: 6px;
  background: #f1f4f2;
  color: #121414;
  font-size: 10px;
  font-weight: 600;
}

/* =========================================================
   STATUS BADGE
========================================================= */

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-created {
  color: #2b6cb0;
  background: #e7f0fb;
}

.status-up-coming {
  color: #b8860b;
  background: #fbf3df;
}

.status-ongoing {
  color: #087c42;
  background: #e1f7e7;
}

.status-completed {
  color: #5c6b73;
  background: #eef1f2;
}

.status-cancelled {
  color: #c73f3f;
  background: #fbe9e9;
}

/* =========================================================
   SECTIONS 2 & 3 — TABLES
========================================================= */

.detail-table {
  box-shadow: none;
  padding: 0 12px;
}

.detail-table :deep(th) {
  height: 44px;
  /* color: #819097; */
  background: #ffffff;
  /* font-size: 9px; */
  /* font-weight: 700; */
  letter-spacing: 0.3px;
}

.detail-table :deep(td) {
  height: 56px;
  /* color: #425b68; */
  border-color: #edf1ef;
  /* font-size: 11px; */
}

/* =========================================================
   NOMINATION ACTIONS
========================================================= */

.nominate-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  border-top: 1px solid #edf1ef;
}

.selected-count {
  color: #87949a;
  font-size: 11px;
}

.nominate-btn {
  min-height: 36px;
  padding: 0 20px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #18b64d, #0ca344);
  font-size: 11px;
  font-weight: 650;
}

.nomination-dialog {
  width: 100%;
  max-width: 90vw;
  border-radius: 13px;
}

.dialog-header {
  padding: 16px 20px;
}

.nomination-stepper {
  box-shadow: none;
}

.reason-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reason-item {
  padding: 10px 0;
  border-bottom: 1px solid #edf1ef;
}

.reason-emp-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #19354a;
  margin-bottom: 6px;
}

.reason-emp-office {
  font-weight: 400;
  color: #8a989e;
}

.trained-row {
  background: #fbe9e9;
}

.trained-row:hover {
  background: #f8dede;
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 13px 20px;
  border-top: 1px solid #edf1ef;
}

/* .save-dialog-btn{
  color: #000;
} */
.reason-cell {
  cursor: help;
}

.reason-tooltip {
  font-size: 11px;
  line-height: 1.5;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 650px) {
  .event-page {
    padding: 14px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

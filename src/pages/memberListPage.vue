<template>
  <div class="page-container">
    <header class="page-header">
      <div class="logo-placeholder">로고</div>
      <h1>회원 관리 (총: {{ totalCount }}명)</h1>
    </header>

    <div class="main-content">
      <div class="list-section">
        <div class="search-filters">
          <input type="text" v-model="searchParams.nick" placeholder="이름 검색" @keyup.enter="searchMembers" />
          <input type="email" v-model="searchParams.email" placeholder="이메일 검색" @keyup.enter="searchMembers" />
          <input type="tel" v-model="searchParams.phone" placeholder="전화번호 검색" @keyup.enter="searchMembers" />
          <button @click="searchMembers" class="button-primary">검색</button>
          <button @click="openAddPopup" class="button-success add-button">회원 추가</button>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="hide-on-mobile">번호</th>
                <th>이름</th>
                <th class="hide-on-tablet">이메일</th>
                <th>전화번호</th>
                <th class="hide-on-mobile">성별</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="memberList.length === 0">
                <td colspan="5">표시할 회원이 없습니다.</td>
              </tr>
              <tr
                v-for="(member, index) in memberList"
                :key="member.userKey"
                @click="selectMember(member)"
                :class="{ 'selected-row': selectedMember?.userKey === member.userKey }"
              >
                <td class="hide-on-mobile">{{ (searchParams.page - 1) * searchParams.size + index + 1 }}</td>
                <td>{{ member.nick }}</td>
                <td class="hide-on-tablet">{{ member.email }}</td>
                <td>{{ member.phone }}</td>
                <td class="hide-on-mobile">{{ member.gender === 'M' ? '남' : '여' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button @click="changePage(searchParams.page - 1)" :disabled="searchParams.page <= 1">&lt;</button>
          <span v-for="page in pageRange" :key="page" @click="changePage(page)" :class="{ 'current-page': page === searchParams.page }">
            {{ page }}
          </span>
          <button @click="changePage(searchParams.page + 1)" :disabled="searchParams.page >= totalPages">&gt;</button>
        </div>
      </div>

      <div class="detail-section">
        <MemberDetail
          :selected-member="selectedMember"
          @edit="openEditPopup"
          @delete="openDeletePopup"
        />
      </div>
    </div>

    <MemberPopup
      :is-visible="isPopupVisible"
      :mode="popupMode"
      :member-data="memberForPopup"
      @close="closePopup"
      @save="handleSaveSuccess"
      @delete-success="handleDeleteSuccess"
    />

    <transition name="fade">
      <div v-if="notification.isVisible" class="notification">
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
// Script 로직은 이전과 동일합니다.
import { ref, onMounted, computed } from 'vue';
import MemberDetail from '@/components/MemberDetail.vue';
import MemberPopup from '@/components/MemberPopup.vue';
import { getMemberList } from '@/api/memberApi';
import type { Member, MemberListParams } from '@/types/member';

const memberList = ref<Member[]>([]);
const searchParams = ref<MemberListParams>({ page: 1, size: 5 }); // 한 페이지에 5개씩 표시
const totalCount = ref(0);
const totalPages = ref(1);

const selectedMember = ref<Member | null>(null);
const memberForPopup = ref<Member | null>(null);
const isPopupVisible = ref(false);
const popupMode = ref<'add' | 'edit' | 'delete'>('add');
const notification = ref({ isVisible: false, message: '' });

const pageRange = computed(() => {
  const start = Math.floor((searchParams.value.page - 1) / 5) * 5 + 1;
  const end = Math.min(start + 4, totalPages.value);
  const range = [];
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
});

const fetchMemberList = async () => {
  try {
    const response = await getMemberList(searchParams.value);
    memberList.value = response.members;
    totalCount.value = response.totalCount;
    totalPages.value = response.totalPages;
    if (memberList.value.length > 0 && !selectedMember.value) {
      selectedMember.value = memberList.value[0];
    }
  } catch (error) { console.error('목록 조회 실패:', error); }
};
const searchMembers = () => {
  searchParams.value.page = 1; fetchMemberList();
};
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    searchParams.value.page = page; fetchMemberList();
  }
};
const selectMember = (member: Member) => {
  selectedMember.value = member;
};
const openAddPopup = () => {
  popupMode.value = 'add'; memberForPopup.value = null; isPopupVisible.value = true;
};
const openEditPopup = (member: Member) => {
  popupMode.value = 'edit'; memberForPopup.value = member; isPopupVisible.value = true;
};
const openDeletePopup = (member: Member) => {
  popupMode.value = 'delete'; memberForPopup.value = member; isPopupVisible.value = true;
};
const closePopup = () => {
  isPopupVisible.value = false;
};
const handleSaveSuccess = () => {
  closePopup(); showNotification('저장되었습니다.'); fetchMemberList();
};
const handleDeleteSuccess = (deletedUserKey: number) => {
  closePopup(); showNotification('삭제되었습니다.');
  memberList.value = memberList.value.filter(m => m.userKey !== deletedUserKey);
  totalCount.value--;
  if (selectedMember.value?.userKey === deletedUserKey) {
    selectedMember.value = memberList.value.length > 0 ? memberList.value[0] : null;
  }
};
const showNotification = (message: string) => {
  notification.value = { isVisible: true, message };
  setTimeout(() => { notification.value.isVisible = false }, 2000);
};
onMounted(fetchMemberList);
</script>

<style scoped>
/* 연보라 테마 UI 디자인 */
:root {
  --primary-color: hsl(260, 65%, 60%);
  --primary-hover-color: hsl(260, 65%, 50%);
  --success-color: hsl(145, 63%, 42%);
  --selected-bg-color: hsl(260, 100%, 97%);
  --text-color: #333;
  --border-color: #e0e0e0;
  --header-bg-color: #f9f9f9;
}

.page-container { padding: 2rem 3rem 4rem 3rem; max-width: 1400px; margin: auto; color: var(--text-color); }

.page-header { display: flex; align-items: center; gap: 20px; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
.logo-placeholder { border: 2px solid var(--border-color); padding: 10px 30px; border-radius: 8px; font-weight: bold; color: #aaa; }
.page-header h1 { margin: 0; color: var(--primary-color); font-size: 1.8rem; }

.main-content { display: flex; gap: 2rem; }
.list-section { flex: 2; }
.detail-section { flex: 1; }

.search-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 1.5rem; }
.search-filters input { padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 6px; transition: all 0.2s; }
.search-filters input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px var(--selected-bg-color); outline: none; }
button { padding: 10px 18px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
button:active { transform: translateY(1px); }
.button-primary { background-color: var(--primary-color); color: white; }
.button-primary:hover { background-color: var(--primary-hover-color); }
.button-success { background-color: var(--success-color); color: white; }
.add-button { margin-left: auto; }

.table-container { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
table { width: 100%; border-collapse: collapse; text-align: center; }
th, td { padding: 14px; border-bottom: 1px solid var(--border-color); }
tr:last-child td { border-bottom: none; }
th { background-color: var(--header-bg-color); font-weight: 600; }
tbody tr { cursor: pointer; transition: background-color 0.2s; }
tbody tr:hover { background-color: #f5f5f5; }
tr.selected-row { background-color: var(--selected-bg-color); font-weight: 500; }

.pagination { display: flex; justify-content: center; align-items: center; margin-top: 1.5rem; gap: 8px; }
.pagination button, .pagination span { background-color: white; border: 1px solid var(--border-color); min-width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; border-radius: 6px; }
.pagination span { cursor: pointer; transition: background-color 0.2s; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination span:hover { background-color: #f5f5f5; }
.pagination .current-page { background-color: var(--primary-color); color: white; border-color: var(--primary-color); font-weight: bold; }

.notification { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: rgba(0, 0, 0, 0.8); color: white; padding: 12px 24px; border-radius: 30px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.fade-enter-active, .fade-leave-active { transition: all 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, 20px); }

@media (max-width: 992px) {
  .main-content { flex-direction: column; }
}
@media (max-width: 768px) {
  .hide-on-tablet { display: none; }
}
@media (max-width: 576px) {
  .hide-on-mobile { display: none; }
}
</style>
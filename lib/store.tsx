'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  Student, 
  JournalEntry, 
  AuditLog, 
  StudentGroup, 
  ActivityType, 
  AspectType, 
  TrendType,
  GroupHistory,
  AISuggestion
} from './types';
import { SEED_USERS, SEED_STUDENTS, SEED_JOURNAL_ENTRIES, SEED_GROUP_HISTORY } from './seed-data';
import { getDaysDiffFromToday } from './utils';
import { calculateStudentGroup, checkStudentNeedsVisit } from './grouping-rules';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, role?: 'guru_bk' | 'admin') => boolean;
  logout: () => void;
  users: User[];
  
  students: Student[];
  addStudent: (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  importStudents: (newStudents: Array<Omit<Student, 'id' | 'created_at' | 'updated_at'>>) => number;
  getStudentById: (id: string) => Student | undefined;

  journals: JournalEntry[];
  addJournal: (data: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => JournalEntry;
  updateJournal: (id: string, data: Partial<JournalEntry>) => void;
  deleteJournal: (id: string) => void;
  getJournalsByStudentId: (studentId: string) => JournalEntry[];
  
  // Grouping & History
  groupHistory: GroupHistory[];
  changeStudentGroup: (studentId: string, newGroup: StudentGroup, reason: string, isManual?: boolean) => void;
  getGroupHistoryByStudentId: (studentId: string) => GroupHistory[];
  getGroupCounts: () => Record<StudentGroup, number>;

  // AI Suggestions
  aiSuggestions: AISuggestion[];
  saveAISuggestion: (suggestion: Omit<AISuggestion, 'id' | 'created_at'>) => AISuggestion;

  auditLogs: AuditLog[];
  addAuditLog: (aksi: AuditLog['aksi'], entitas: AuditLog['entitas'], entitas_id?: string, detail?: string) => void;

  resetToDefaultSeed: () => void;

  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Helper selectors
  getOverdueFollowUps: () => JournalEntry[];
  getTodayFollowUps: () => JournalEntry[];
  getUpcomingFollowUps: () => JournalEntry[];
  getStudentsUnrecorded14Days: () => Student[];
  getCategoryStats: () => { baik: number; perhatian: number; intervensi: number; total: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_STUDENTS = 'bk_harian_students_v2';
const STORAGE_KEY_JOURNALS = 'bk_harian_journals_v2';
const STORAGE_KEY_USER = 'bk_harian_active_user_v2';
const STORAGE_KEY_LOGS = 'bk_harian_audit_logs_v2';
const STORAGE_KEY_THEME = 'bk_harian_theme_mode_v2';
const STORAGE_KEY_GROUP_HISTORY = 'bk_harian_group_history_v2';
const STORAGE_KEY_AI_SUGGESTIONS = 'bk_harian_ai_suggestions_v2';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [groupHistory, setGroupHistory] = useState<GroupHistory[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Inisialisasi awal dari LocalStorage atau Seed Data
  useEffect(() => {
    try {
      // 1. Load User
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.id === 'user-guru-1' || parsed.nama?.includes('Rahmawati')) {
            setCurrentUser(SEED_USERS[0]);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(SEED_USERS[0]));
          } else {
            setCurrentUser(parsed);
          }
        } catch {
          setCurrentUser(SEED_USERS[0]);
        }
      } else {
        setCurrentUser(SEED_USERS[0]);
      }

      // 2. Load Students
      const savedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        setStudents(SEED_STUDENTS);
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(SEED_STUDENTS));
      }

      // 3. Load Journals
      const savedJournals = localStorage.getItem(STORAGE_KEY_JOURNALS);
      if (savedJournals) {
        setJournals(JSON.parse(savedJournals));
      } else {
        setJournals(SEED_JOURNAL_ENTRIES);
        localStorage.setItem(STORAGE_KEY_JOURNALS, JSON.stringify(SEED_JOURNAL_ENTRIES));
      }

      // 4. Load Group History
      const savedGroupHistory = localStorage.getItem(STORAGE_KEY_GROUP_HISTORY);
      if (savedGroupHistory) {
        setGroupHistory(JSON.parse(savedGroupHistory));
      } else {
        setGroupHistory(SEED_GROUP_HISTORY);
        localStorage.setItem(STORAGE_KEY_GROUP_HISTORY, JSON.stringify(SEED_GROUP_HISTORY));
      }

      // 5. Load AI Suggestions
      const savedAI = localStorage.getItem(STORAGE_KEY_AI_SUGGESTIONS);
      if (savedAI) {
        setAiSuggestions(JSON.parse(savedAI));
      } else {
        setAiSuggestions([]);
      }

      // 6. Load Logs
      const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      if (savedLogs) {
        setAuditLogs(JSON.parse(savedLogs));
      } else {
        const initialLog: AuditLog = {
          id: 'log-init',
          user_id: SEED_USERS[0].id,
          user_nama: SEED_USERS[0].nama,
          aksi: 'LOGIN',
          entitas: 'system',
          detail: 'Sistem BK Harian berhasil diinisialisasi.',
          created_at: new Date().toISOString(),
        };
        setAuditLogs([initialLog]);
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify([initialLog]));
      }

      // 7. Load Theme
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
      setStudents(SEED_STUDENTS);
      setJournals(SEED_JOURNAL_ENTRIES);
      setCurrentUser(SEED_USERS[0]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync state to LocalStorage
  const persistStudents = (data: Student[]) => {
    setStudents(data);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(data));
  };

  const persistJournals = (data: JournalEntry[]) => {
    setJournals(data);
    localStorage.setItem(STORAGE_KEY_JOURNALS, JSON.stringify(data));
  };

  const persistGroupHistory = (data: GroupHistory[]) => {
    setGroupHistory(data);
    localStorage.setItem(STORAGE_KEY_GROUP_HISTORY, JSON.stringify(data));
  };

  const persistAISuggestions = (data: AISuggestion[]) => {
    setAiSuggestions(data);
    localStorage.setItem(STORAGE_KEY_AI_SUGGESTIONS, JSON.stringify(data));
  };

  const persistLogs = (data: AuditLog[]) => {
    setAuditLogs(data);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(data));
  };

  const addAuditLog = (aksi: AuditLog['aksi'], entitas: AuditLog['entitas'], entitas_id?: string, detail?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: currentUser?.id || 'guest',
      user_nama: currentUser?.nama || 'Tamu',
      aksi,
      entitas,
      entitas_id,
      detail: detail || `Aktivitas ${aksi} pada ${entitas}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newLog, ...auditLogs.slice(0, 99)];
    persistLogs(updated);
  };

  // Auth functions
  const login = (email: string, role?: 'guru_bk' | 'admin'): boolean => {
    const user = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      (role === 'admin' ? SEED_USERS[2] : SEED_USERS[0]);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      addAuditLog('LOGIN', 'auth', user.id, `Pengguna ${user.nama} berhasil masuk.`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('LOGIN', 'auth', currentUser.id, `Pengguna ${currentUser.nama} keluar.`);
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(STORAGE_KEY_THEME, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(STORAGE_KEY_THEME, 'light');
      }
      return next;
    });
  };

  // Student CRUD
  const addStudent = (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Student => {
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newStudent, ...students];
    persistStudents(updated);
    addAuditLog('CREATE', 'student', newStudent.id, `Menambahkan siswa baru: ${newStudent.nama} (${newStudent.kelas})`);
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    const updated = students.map((s) =>
      s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s
    );
    persistStudents(updated);
    addAuditLog('UPDATE', 'student', id, `Memperbarui data siswa ID: ${id}`);
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    const updated = students.filter((s) => s.id !== id);
    persistStudents(updated);
    // Hapus juga riwayat jurnal siswa ini
    const updatedJournals = journals.filter((j) => j.student_id !== id);
    persistJournals(updatedJournals);
    addAuditLog('DELETE', 'student', id, `Menghapus data siswa: ${target?.nama || id}`);
  };

  const importStudents = (newStudents: Array<Omit<Student, 'id' | 'created_at' | 'updated_at'>>): number => {
    const created: Student[] = newStudents.map((item, idx) => ({
      ...item,
      id: `std-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    const combined = [...created, ...students];
    persistStudents(combined);
    addAuditLog('CREATE', 'student', undefined, `Impor massal ${created.length} siswa berhasil.`);
    return created.length;
  };

  const getStudentById = (id: string): Student | undefined => {
    return students.find((s) => s.id === id);
  };

  // Group Management & History
  const changeStudentGroup = (
    studentId: string, 
    newGroup: StudentGroup, 
    reason: string, 
    isManual: boolean = true
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student || student.kelompok_terkini === newGroup) return;

    const oldGroup = student.kelompok_terkini;

    // Catat ke group history
    const historyItem: GroupHistory = {
      id: `gh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      dari_kelompok: oldGroup,
      ke_kelompok: newGroup,
      alasan: reason || (isManual ? 'Perubahan manual oleh Guru BK' : 'Perubahan otomatis sistem'),
      otomatis_atau_manual: isManual ? 'manual' : 'otomatis',
      created_at: new Date().toISOString(),
    };

    const updatedHistory = [historyItem, ...groupHistory];
    persistGroupHistory(updatedHistory);

    // Update siswa
    updateStudent(studentId, {
      kelompok_terkini: newGroup,
      status_terkini: newGroup,
    });

    addAuditLog(
      'GROUP_CHANGE',
      'group',
      studentId,
      `Perpindahan kelompok ${student.nama}: dari "${oldGroup}" ke "${newGroup}" (${isManual ? 'Manual' : 'Otomatis'}). Alasan: ${reason}`
    );
  };

  const getGroupHistoryByStudentId = (studentId: string): GroupHistory[] => {
    return groupHistory
      .filter((gh) => gh.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  // Journal CRUD
  const addJournal = (data: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): JournalEntry => {
    const studentJournals = journals.filter((j) => j.student_id === data.student_id);

    // Hitung evaluasi kelompok otomatis
    const autoEval = calculateStudentGroup({
      skor_kondisi: data.skor_kondisi,
      tren: data.tren,
      uraian: data.uraian,
    }, studentJournals);

    const finalGroup = data.kelompok || autoEval.suggestedGroup;

    const newJournal: JournalEntry = {
      ...data,
      kelompok: finalGroup,
      kategori: finalGroup,
      id: `jrn-${Date.now()}`,
      guru_nama: currentUser?.nama || 'Guru BK',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedJournals = [newJournal, ...journals];
    persistJournals(updatedJournals);

    // Sinkronisasi status siswa dan catat riwayat perpindahan jika kelompok berubah
    const targetStudent = students.find((s) => s.id === data.student_id);
    if (targetStudent) {
      if (targetStudent.kelompok_terkini !== finalGroup) {
        changeStudentGroup(targetStudent.id, finalGroup, autoEval.reason, false);
      }
      updateStudent(targetStudent.id, {
        skor_terkini: data.skor_kondisi,
        updated_at: new Date().toISOString(),
      });
    }

    addAuditLog(
      'CREATE',
      'journal',
      newJournal.id,
      `Mencatat jurnal ${newJournal.jenis_kegiatan} untuk siswa: ${targetStudent?.nama || data.student_id} [Skor: ${newJournal.skor_kondisi}, Kelompok: ${newJournal.kelompok}]`
    );

    return newJournal;
  };

  const updateJournal = (id: string, data: Partial<JournalEntry>) => {
    const updated = journals.map((j) =>
      j.id === id ? { ...j, ...data, updated_at: new Date().toISOString() } : j
    );
    persistJournals(updated);

    if (data.kelompok && data.student_id) {
      updateStudent(data.student_id, { 
        kelompok_terkini: data.kelompok,
        status_terkini: data.kelompok,
        skor_terkini: data.skor_kondisi,
      });
    }

    addAuditLog('UPDATE', 'journal', id, `Memperbarui catatan jurnal ID: ${id}`);
  };

  const deleteJournal = (id: string) => {
    const target = journals.find((j) => j.id === id);
    const updated = journals.filter((j) => j.id !== id);
    persistJournals(updated);
    addAuditLog('DELETE', 'journal', id, `Menghapus catatan jurnal: ${target?.jenis_kegiatan}`);
  };

  const getJournalsByStudentId = (studentId: string): JournalEntry[] => {
    return journals
      .filter((j) => j.student_id === studentId)
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  };

  // AI Suggestions Storage
  const saveAISuggestion = (suggestion: Omit<AISuggestion, 'id' | 'created_at'>): AISuggestion => {
    const newSug: AISuggestion = {
      ...suggestion,
      id: `sug-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newSug, ...aiSuggestions];
    persistAISuggestions(updated);
    addAuditLog('AI_SUGGESTION', 'ai', newSug.id, `Menyimpan rekomendasi AI untuk siswa ID: ${newSug.student_id}`);
    return newSug;
  };

  // Reset to default seed
  const resetToDefaultSeed = () => {
    persistStudents(SEED_STUDENTS);
    persistJournals(SEED_JOURNAL_ENTRIES);
    persistGroupHistory(SEED_GROUP_HISTORY);
    persistAISuggestions([]);
    addAuditLog('UPDATE', 'system', undefined, 'Mereset database ke data awal contoh BK Harian.');
  };

  // Selectors
  const getOverdueFollowUps = (): JournalEntry[] => {
    return journals.filter((j) => {
      if (j.status_tindak_lanjut === 'Selesai' || !j.tanggal_tindak_lanjut) return false;
      const diff = getDaysDiffFromToday(j.tanggal_tindak_lanjut);
      return diff < 0;
    });
  };

  const getTodayFollowUps = (): JournalEntry[] => {
    return journals.filter((j) => {
      if (j.status_tindak_lanjut === 'Selesai' || !j.tanggal_tindak_lanjut) return false;
      const diff = getDaysDiffFromToday(j.tanggal_tindak_lanjut);
      return diff === 0;
    });
  };

  const getUpcomingFollowUps = (): JournalEntry[] => {
    return journals.filter((j) => {
      if (j.status_tindak_lanjut === 'Selesai' || !j.tanggal_tindak_lanjut) return false;
      const diff = getDaysDiffFromToday(j.tanggal_tindak_lanjut);
      return diff > 0 && diff <= 7;
    });
  };

  const getStudentsUnrecorded14Days = (): Student[] => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    return students.filter((s) => {
      const studentJournals = journals.filter((j) => j.student_id === s.id);
      if (studentJournals.length === 0) return true;
      const latestJournalDate = new Date(
        Math.max(...studentJournals.map((j) => new Date(j.tanggal).getTime()))
      );
      return latestJournalDate < fourteenDaysAgo;
    });
  };

  const getGroupCounts = (): Record<StudentGroup, number> => {
    const counts: Record<StudentGroup, number> = {
      'Berkembang Baik': 0,
      'Stabil': 0,
      'Belum Ada Kemajuan': 0,
      'Perlu Bimbingan': 0,
      'Perlu Intervensi Segera': 0,
    };

    students.forEach((s) => {
      const g = s.kelompok_terkini || (s.status_terkini as StudentGroup) || 'Stabil';
      if (counts[g] !== undefined) {
        counts[g]++;
      } else {
        counts['Stabil']++;
      }
    });

    return counts;
  };

  const getCategoryStats = () => {
    const counts = getGroupCounts();
    return {
      baik: counts['Berkembang Baik'] + counts['Stabil'],
      perhatian: counts['Belum Ada Kemajuan'] + counts['Perlu Bimbingan'],
      intervensi: counts['Perlu Intervensi Segera'],
      total: students.length,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        users: SEED_USERS,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        getStudentById,
        journals,
        addJournal,
        updateJournal,
        deleteJournal,
        getJournalsByStudentId,
        groupHistory,
        changeStudentGroup,
        getGroupHistoryByStudentId,
        getGroupCounts,
        aiSuggestions,
        saveAISuggestion,
        auditLogs,
        addAuditLog,
        resetToDefaultSeed,
        isDarkMode,
        toggleDarkMode,
        getOverdueFollowUps,
        getTodayFollowUps,
        getUpcomingFollowUps,
        getStudentsUnrecorded14Days,
        getCategoryStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}

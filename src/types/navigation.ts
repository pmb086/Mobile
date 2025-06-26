export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
  TeacherDetail: { id: number };
  BookingForm: { teacherId: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 
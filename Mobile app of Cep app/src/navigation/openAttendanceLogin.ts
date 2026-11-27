import { CommonActions } from '@react-navigation/native';

export function openAttendanceLogin(navigation: any, group: 'choir' | 'anointed') {
  const action = CommonActions.navigate({
    name: 'AttendanceLogin',
    params: { group },
  });
  let current = navigation;
  const seen = new Set<any>();
  while (current && !seen.has(current)) {
    seen.add(current);
    const names: string[] = current.getState?.()?.routeNames || [];
    if (names.includes('AttendanceLogin')) {
      current.dispatch(action);
      return;
    }
    current = current.getParent?.();
  }
  navigation.dispatch(action);
}

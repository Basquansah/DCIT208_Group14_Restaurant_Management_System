export const MENU_AVAILABILITY_STORAGE_KEY = 'sarah_menu_availability';

interface MenuAvailability {
  id: string;
  isAvailable: boolean;
}

export interface ServerMenuItem {
  id: string | number;
  [key: string]: unknown;
  is_available?: unknown;
  isAvailable?: unknown;
}

function isMenuAvailability(value: unknown): value is MenuAvailability {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'isAvailable' in value &&
    typeof value.isAvailable === 'boolean'
  );
}

function isServerMenuItem(value: unknown): value is ServerMenuItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    (typeof value.id === 'string' || typeof value.id === 'number')
  );
}

export function readMenuAvailability(): Map<string, boolean> {
  const storedMenu = localStorage.getItem(MENU_AVAILABILITY_STORAGE_KEY);
  if (storedMenu === null) return new Map();

  const availabilityList: unknown = JSON.parse(storedMenu);
  if (!Array.isArray(availabilityList)) {
    throw new Error('Stored menu availability must be an array.');
  }

  return new Map(
    availabilityList
      .filter(isMenuAvailability)
      .map(({ id, isAvailable }) => [id, isAvailable]),
  );
}

export function applyServerMenuAvailability<T extends MenuAvailability>(
  items: T[],
  serverItems: unknown,
): T[] {
  if (
    typeof serverItems === 'object' &&
    serverItems !== null &&
    'success' in serverItems &&
    'data' in serverItems
  ) {
    serverItems = serverItems.data;
  }

  if (!Array.isArray(serverItems)) {
    throw new Error('Server menu response must be an array.');
  }

  let changed = false;
  const updatedItems = items.map((item) => {
    const serverItem = serverItems.find(
      (value): value is ServerMenuItem =>
        isServerMenuItem(value) && String(item.id) === String(value.id),
    );
    if (!serverItem) return item;

    const isAvailable = serverItem.is_available === false || serverItem.isAvailable === false
      ? false
      : serverItem.is_available === true || serverItem.isAvailable === true;
    if (isAvailable === item.isAvailable) return item;

    changed = true;
    return { ...item, isAvailable };
  });

  return changed ? updatedItems : items;
}

export function mergeServerMenuItems<T extends MenuAvailability>(
  items: T[],
  serverItems: unknown,
  mapServerItem: (serverItem: ServerMenuItem, existingItem?: T) => T,
): T[] {
  if (
    typeof serverItems === 'object' &&
    serverItems !== null &&
    'success' in serverItems &&
    'data' in serverItems
  ) {
    serverItems = serverItems.data;
  }
  if (!Array.isArray(serverItems)) {
    throw new Error('Server menu response must be an array.');
  }

  const seenNames = new Set<string>();
  const validItems = serverItems.filter((value): value is ServerMenuItem => {
    if (!isServerMenuItem(value)) return false;

    const name = typeof value.name === 'string'
      ? value.name.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
      : '';
    if (!name) return true;
    if (seenNames.has(name)) return false;
    seenNames.add(name);
    return true;
  });
  if (validItems.length === 0) return items;

  const currentById = new Map(items.map((item) => [String(item.id), item]));
  return validItems.map((serverItem) =>
    mapServerItem(serverItem, currentById.get(String(serverItem.id))),
  );
}

export function applyMenuAvailability<T extends MenuAvailability>(
  items: T[],
  availability: ReadonlyMap<string, boolean>,
): T[] {
  let changed = false;
  const updatedItems = items.map((item) => {
    const isAvailable = availability.get(item.id);
    if (isAvailable === undefined || isAvailable === item.isAvailable) return item;
    changed = true;
    return { ...item, isAvailable };
  });

  return changed ? updatedItems : items;
}

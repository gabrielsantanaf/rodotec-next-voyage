// Local stub replacing Supabase client — no external dependency.
// Minimal API backed by localStorage to keep UI working offline.

type TableName = 'products' | 'quote_requests' | 'categories';
type Filter = { field: string; value: any } | null;

function ensureDb() {
  const raw = localStorage.getItem('local_db');
  if (raw) return JSON.parse(raw);
  const initial = {
    products: [],
    quote_requests: [],
    categories: [
      { id: 'cat-geral', name: 'Geral', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'cat-acessorios', name: 'Acessórios', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ],
  } as Record<TableName, any[]>;
  localStorage.setItem('local_db', JSON.stringify(initial));
  return initial;
}

function saveDb(db: Record<TableName, any[]>) {
  localStorage.setItem('local_db', JSON.stringify(db));
}

class QueryBuilder {
  private table: TableName;
  private filter: Filter = null;
  private orderField: string | null = null;
  private ascending = true;

  constructor(table: TableName) {
    this.table = table;
  }

  select(_columns?: string) {
    const db = ensureDb();
    let data = [...(db[this.table] || [])];
    if (this.filter) {
      data = data.filter((item) => item[this.filter!.field] === this.filter!.value);
    }
    if (this.orderField) {
      data.sort((a, b) => {
        const av = a[this.orderField!];
        const bv = b[this.orderField!];
        if (av === bv) return 0;
        if (this.ascending) return av > bv ? 1 : -1;
        return av < bv ? 1 : -1;
      });
    }
    return Promise.resolve({ data, error: null });
  }

  order(field: string, opts: { ascending?: boolean } = {}) {
    this.orderField = field;
    this.ascending = opts.ascending ?? true;
    return this;
  }

  eq(field: string, value: any) {
    this.filter = { field, value };
    return this;
  }

  single() {
    return this.select().then(({ data }) => {
      const item = Array.isArray(data) ? data[0] || null : null;
      if (!item) return { data: null, error: new Error('Not found') };
      return { data: item, error: null };
    });
  }

  insert(items: any[]) {
    const db = ensureDb();
    const now = new Date().toISOString();
    const augmented = items.map((item) => ({
      id: item.id || crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      ...item,
    }));
    db[this.table] = [...(db[this.table] || []), ...augmented];
    saveDb(db);
    return Promise.resolve({ data: augmented, error: null });
  }

  update(values: Record<string, any>) {
    const db = ensureDb();
    const list = db[this.table] || [];
    if (!this.filter) return Promise.resolve({ data: null, error: new Error('No filter') });
    const idx = list.findIndex((i: any) => i[this.filter!.field] === this.filter!.value);
    if (idx === -1) return Promise.resolve({ data: null, error: new Error('Not found') });
    const updated = { ...list[idx], ...values, updated_at: new Date().toISOString() };
    list[idx] = updated;
    db[this.table] = list;
    saveDb(db);
    return Promise.resolve({ data: updated, error: null });
  }
}

export const supabase = {
  from(table: TableName) {
    return new QueryBuilder(table);
  },
};
import React, { useState, useEffect } from "react";
import {
  Database,
  Play,
  Table as TableIcon,
  Plus,
  Download,
  Code2,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Search,
  Layers,
  Sparkles,
} from "lucide-react";

interface ColumnInfo {
  name: string;
  type: string;
  isPrimary?: boolean;
}

interface TableData {
  name: string;
  columns: ColumnInfo[];
  rows: any[];
}

export const DatabaseStudio: React.FC = () => {
  const [tables, setTables] = useState<Record<string, TableData>>({});
  const [selectedTable, setSelectedTable] = useState<string>("extracted_web_data");
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM extracted_web_data ORDER BY id DESC;");
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [roomEntityCode, setRoomEntityCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/database/tables");
      const data = await res.json();
      if (data.tables) {
        setTables(data.tables);
        const current = data.tables[selectedTable] || Object.values(data.tables)[0];
        if (current) {
          setQueryResult({
            columns: current.columns.map((c: any) => c.name),
            rows: current.rows,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeSql = async () => {
    setIsExecuting(true);
    setRoomEntityCode(null);
    try {
      const res = await fetch("/api/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      const data = await res.json();
      if (data.success && data.rows) {
        setQueryResult({
          columns: data.columns || (data.rows.length > 0 ? Object.keys(data.rows[0]) : []),
          rows: data.rows,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectTable = (tblName: string) => {
    setSelectedTable(tblName);
    setSqlQuery(`SELECT * FROM ${tblName} ORDER BY 1 DESC;`);
    const tbl = tables[tblName];
    if (tbl) {
      setQueryResult({
        columns: tbl.columns.map((c) => c.name),
        rows: tbl.rows,
      });
    }
    setRoomEntityCode(null);
  };

  const generateRoomEntity = () => {
    const tbl = tables[selectedTable];
    if (!tbl) return;

    const className = tbl.name
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") + "Entity";

    const fields = tbl.columns
      .map((col) => {
        const ktType =
          col.type === "INTEGER"
            ? "Long"
            : col.type === "REAL"
            ? "Double"
            : col.type === "DATETIME"
            ? "String"
            : "String";
        const primaryTag = col.isPrimary
          ? "    @PrimaryKey(autoGenerate = true)\n"
          : "";
        return `${primaryTag}    val ${col.name}: ${ktType}`;
      })
      .join(",\n");

    const code = `package com.droidcraft.app.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

/**
 * DroidCraft Dahili Veritabanından Otomatik Üretilen Room Varlığı (Entity)
 * Tablo: ${tbl.name}
 */
@Entity(tableName = "${tbl.name}")
data class ${className}(
${fields}
)

@Dao
interface ${className}Dao {
    @Query("SELECT * FROM ${tbl.name} ORDER BY id DESC")
    fun getAll(): Flow<List<${className}>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: ${className}): Long

    @Delete
    suspend fun delete(item: ${className})
}`;

    setRoomEntityCode(code);
  };

  const exportCsv = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const headers = queryResult.columns.join(",");
    const rows = queryResult.rows.map((r) =>
      queryResult.columns.map((col) => JSON.stringify(r[col] || "")).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedTable}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeTableObj = tables[selectedTable];
  const displayedRows = (queryResult?.rows || []).filter((r) => {
    if (!searchFilter.trim()) return true;
    return Object.values(r).some((val) =>
      String(val).toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Dahili Veritabanı Stüdyosu & SQL Sorgu Motoru (Embedded SQLite / Room)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-[10px] font-mono">
                SQLite 3.45 / Room Compatible
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Toplanan web verilerini, mobil telemetriyi ve derleme kütüklerini sorgulayın, düzenleyin ve tek tıkla Android Room Entity koduna dönüştürün.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={generateRoomEntity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950 border border-indigo-800/60 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Room Entity Üret</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* SQL Query Editor & Tables Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tables Catalog (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 text-xs">
              Veritabanı Tabloları ({Object.keys(tables).length})
            </span>
            <button onClick={fetchTables} className="p-1 text-slate-400 hover:text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {Object.keys(tables).map((tbl) => (
              <button
                key={tbl}
                onClick={() => handleSelectTable(tbl)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                  selectedTable === tbl
                    ? "border-cyan-500 bg-cyan-950/40 text-white shadow-sm"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-xs text-slate-200 truncate">{tbl}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  {tables[tbl].rows.length} satır • {tables[tbl].columns.length} sütun
                </div>
              </button>
            ))}
          </div>

          {activeTableObj && (
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
              <span className="font-semibold text-slate-300 text-[11px] block">
                Şema (Sütunlar):
              </span>
              <div className="space-y-1 font-mono text-[10px]">
                {activeTableObj.columns.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-950 px-2 py-1 rounded">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-cyan-400">{c.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: SQL Editor & Results Viewer (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {/* SQL Editor Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                SQL Sorgusu Çalıştır (Interactive SQL Runner):
              </span>
              <button
                onClick={executeSql}
                disabled={isExecuting}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Sorguyu Çalıştır (Execute)</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none selection:bg-cyan-500/30"
            />
          </div>

          {/* Generated Room Entity Code Preview if triggered */}
          {roomEntityCode && (
            <div className="bg-slate-950 border border-indigo-800/60 rounded-2xl p-4 space-y-2 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Otomatik Üretilen Android Kotlin Room Varlığı:
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomEntityCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 text-cyan-400 hover:underline text-xs"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? "Kopyalandı!" : "Kodu Kopyala"}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {roomEntityCode}
              </pre>
            </div>
          )}

          {/* Table Results */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-slate-200">
                  Sonuç Tablosu ({displayedRows.length} kayıt)
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1.5" />
                <input
                  type="text"
                  placeholder="Satırlarda ara..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Scrollable Data Table */}
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/40">
                    {(queryResult?.columns || []).map((col) => (
                      <th key={col} className="py-2.5 px-3 font-semibold font-mono text-[11px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={(queryResult?.columns || []).length || 1}
                        className="p-6 text-center text-slate-500"
                      >
                        Sorgu sonucu satır bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        {(queryResult?.columns || []).map((col) => (
                          <td key={col} className="py-2 px-3 text-[11px] truncate max-w-xs">
                            {typeof row[col] === "object"
                              ? JSON.stringify(row[col])
                              : String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

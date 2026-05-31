import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../../api/authFetch.js';

const API_BASE = '/api/s3';
const MODELS_API_BASE = '/api/models';
const ADMIN_USERS_API = '/api/admin/users';

/** Native selects need a solid dark surface so option text is not white-on-white in some browsers. */
const SELECT_FIELD =
  'px-3 py-1.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-600/90 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/40';

const TEXT_FIELD =
  'px-3 py-1.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-600/90 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40';

const FILTER_FIELD =
  'px-2.5 py-1.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-600/90 text-xs placeholder:text-slate-500 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40';

export function ModelsAdmin() {
  const [objects, setObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadKey, setUploadKey] = useState('');
  const [ownerNickname, setOwnerNickname] = useState('');
  const [users, setUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [models, setModels] = useState([]);
  const [searchFileName, setSearchFileName] = useState('');
  const [searchNickname, setSearchNickname] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const [s3Res, modelsRes, usersRes] = await Promise.all([
        authFetch(`${API_BASE}/objects`),
        authFetch(MODELS_API_BASE),
        authFetch(ADMIN_USERS_API),
      ]);

      const s3Data = await s3Res.json().catch(() => ({}));
      if (!s3Res.ok) throw new Error(s3Data.error || s3Data.message || 'Failed to load S3 objects');
      setObjects(Array.isArray(s3Data.objects) ? s3Data.objects : []);

      const modelsData = await modelsRes.json().catch(() => ({}));
      if (modelsRes.ok && Array.isArray(modelsData.models)) {
        setModels(modelsData.models);
      } else {
        setModels([]);
      }

      const usersData = await usersRes.json().catch(() => ({}));
      if (usersRes.ok && Array.isArray(usersData.users)) {
        setUsers(usersData.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
      setObjects([]);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadStatus({ type: 'error', message: 'Choose a file' });
      return;
    }
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      if (uploadKey.trim()) formData.append('key', uploadKey.trim());
      if (ownerNickname.trim()) formData.append('ownerNickname', ownerNickname.trim());
      const res = await authFetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || 'Upload failed');
      setUploadStatus({ type: 'success', message: `Uploaded: ${data.key}` });
      setUploadFile(null);
      setUploadKey('');
      setOwnerNickname('');
      if (e.target.elements?.file) e.target.elements.file.value = '';
      load();
    } catch (err) {
      setUploadStatus({ type: 'error', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (key) => {
    try {
      const res = await authFetch(`${API_BASE}/download/${encodeURIComponent(key)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Download failed');
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleRemove = async (key) => {
    if (!window.confirm(`Delete "${key}"?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/object/${encodeURIComponent(key)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      if (data.warning) {
        setStatus({ type: 'error', message: data.warning });
      } else {
        setStatus({
          type: 'success',
          message: data.dbRemoved ? `Removed from S3 and database: ${key}` : `Removed from S3: ${key}`,
        });
      }
      load();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleOpenLab = async (key) => {
    try {
      const res = await authFetch('/api/admin/lab/from-s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not prepare Lab file');
      setStatus({ type: 'success', message: `Lab file ready: ${key}` });
      window.location.assign(`/configurator?labKey=${encodeURIComponent(key)}`);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const filteredObjects = objects.filter((obj) => {
    const key = typeof obj.Key === 'string' ? obj.Key.toLowerCase() : '';
    return key.endsWith('.gltf') || key.endsWith('.glb');
  });

  const ownerByKey = models.reduce((acc, m) => {
    if (m && typeof m.s3Key === 'string') {
      acc[m.s3Key] = m.ownerNickname || null;
    }
    return acc;
  }, {});

  const searchedObjects = filteredObjects.filter((obj) => {
    const rawKey = obj.Key ?? '';
    const nick = (ownerByKey[rawKey] ?? '').toString();
    const fileMatch = !searchFileName.trim() || rawKey.toLowerCase().includes(searchFileName.trim().toLowerCase());
    const selectedNick = searchNickname.trim();
    const nickMatch = !selectedNick || nick === selectedNick;
    return fileMatch && nickMatch;
  });

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner shadow-black/20">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-300" />
            <span className="text-xs text-white/70">Liquid Glass Kit</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight mt-3 text-white">3D Library</h1>
          <p className="text-xs text-white/60 mt-1">
            Upload and manage files in S3 (R2): <code className="text-cyan-200/90">.gltf</code>,{' '}
            <code className="text-cyan-200/90">.glb</code>, and other formats.
          </p>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner shadow-black/20 p-4">
        <div className="pointer-events-none absolute -top-16 -left-16 w-40 h-40 rounded-full bg-fuchsia-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-cyan-400/12 blur-3xl" />

        <div className="relative z-10">
          <h2 className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wide">Upload to S3</h2>
          <form onSubmit={handleUpload} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-white/70">
              File
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="file"
                    name="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    aria-label="Choose file to upload"
                  />
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-600/80 text-xs text-slate-100 cursor-pointer hover:bg-slate-800 transition-colors">
                    Browse…
                  </div>
                </div>
                <span className="text-xs text-slate-300">{uploadFile ? uploadFile.name : 'No file selected'}</span>
              </div>
            </label>

            <label className="flex flex-col gap-1 text-xs text-white/70">
              S3 key (optional)
              <input
                type="text"
                placeholder="filename.gltf"
                value={uploadKey}
                onChange={(e) => setUploadKey(e.target.value)}
                className={`w-44 ${TEXT_FIELD}`}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-white/70">
              Owner (optional)
              <select
                value={ownerNickname}
                onChange={(e) => setOwnerNickname(e.target.value)}
                className={`w-52 ${SELECT_FIELD}`}
                aria-label="Select owner user"
              >
                <option value="" className="bg-slate-900 text-slate-100">
                  — No owner —
                </option>
                {users.map((u) => (
                  <option
                    key={u.id || u.nickname}
                    value={u.nickname || ''}
                    className="bg-slate-900 text-slate-100"
                  >
                    {u.nickname || '—'}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={isUploading || !uploadFile}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500/60 to-cyan-400/45 hover:from-fuchsia-400/65 hover:to-emerald-400/40 disabled:opacity-50 text-white text-xs font-semibold border border-white/10 shadow-[0_20px_70px_-45px_rgba(0,255,200,0.55)] transition-colors"
            >
              {isUploading ? 'Uploading…' : 'Upload'}
            </button>
          </form>

          {uploadStatus && (
            <p className={`mt-2 text-sm ${uploadStatus.type === 'success' ? 'text-emerald-200' : 'text-red-200'}`}>
              {uploadStatus.message}
            </p>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner shadow-black/20 p-4">
        <div className="pointer-events-none absolute -top-16 -left-16 w-44 h-44 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-white">Bucket files</h2>
            <button
              type="button"
              onClick={load}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 disabled:opacity-60 border border-slate-600/80 text-xs text-slate-100 shadow-inner shadow-black/20"
            >
              {isLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {status && (
            <div
              className={`mb-4 text-sm ${
                status.type === 'success' ? 'text-emerald-200' : 'text-red-200'
              }`}
            >
              {status.message}
            </div>
          )}

          {filteredObjects.length === 0 && !isLoading ? (
            <div className="text-slate-300 text-sm">No <code className="text-cyan-200/90">.gltf</code> or{' '}
              <code className="text-cyan-200/90">.glb</code> files in the bucket.</div>
          ) : (
            <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-950/40">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/50">
                    <th className="text-left py-2 pr-4 font-semibold text-slate-200 align-top">
                      <div className="flex flex-col gap-1">
                        <span>File name</span>
                        <input
                          type="text"
                          placeholder="Search…"
                          value={searchFileName}
                          onChange={(e) => setSearchFileName(e.target.value)}
                          className={FILTER_FIELD}
                          aria-label="Search by file name"
                        />
                      </div>
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold text-slate-200 align-top">
                      <div className="flex flex-col gap-1">
                        <span>Owner</span>
                        <select
                          value={searchNickname}
                          onChange={(e) => setSearchNickname(e.target.value)}
                          className={FILTER_FIELD}
                          aria-label="Filter by owner"
                        >
                          <option value="" className="bg-slate-900 text-slate-100">
                            All users
                          </option>
                          {users.map((u) => (
                            <option
                              key={u.id || u.nickname}
                              value={u.nickname || ''}
                              className="bg-slate-900 text-slate-100"
                            >
                              {u.nickname || '—'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </th>
                    <th className="text-left py-2 w-48 align-top" />
                  </tr>
                </thead>
                <tbody>
                  {searchedObjects.map((obj) => {
                    const rawKey = obj.Key;
                    const owner = ownerByKey[rawKey] || '—';
                    return (
                      <tr key={rawKey} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-2 pr-4 font-mono text-xs text-slate-200">{rawKey}</td>
                        <td className="py-2 pr-4 text-xs font-medium text-slate-100">{owner}</td>
                        <td className="py-2">
                          <div className="flex w-full items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleDownload(rawKey)}
                              className="p-1.5 rounded-xl border border-white/15 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                              aria-label="Download file"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 12l4 4m0 0l4-4m-4 4V4"
                                />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenLab(rawKey)}
                              className="p-1.5 rounded-xl border border-amber-400/35 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100"
                              aria-label="Open in Lab"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 3v4.586a1 1 0 01-.293.707L4 10l4 8h8l4-8-1.707-1.707A1 1 0 0118 7.586V3"
                                />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemove(rawKey)}
                              className="p-1.5 rounded-xl border border-red-400/35 bg-red-500/15 hover:bg-red-500/25 text-red-100"
                              aria-label="Delete file"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0h8l-1-3H9l-1 3z"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

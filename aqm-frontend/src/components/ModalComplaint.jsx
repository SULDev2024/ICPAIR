import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "./ModalComplaint.css";

const ModalComplaint = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    district: "",
    description: "",
    name: "",
    email: ""
  });

  const [errors, setErrors] = useState({});
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    // load districts from backend for reliable id mapping
    const load = async () => {
      try {
        // Try multiple base URLs to be resilient in dev/prod setups
        const candidates = [];
        if (process.env.REACT_APP_API_URL) candidates.push(process.env.REACT_APP_API_URL);
        candidates.push("http://localhost:5005/api");
        candidates.push("/api");

        let got = false;
        for (const base of candidates) {
          try {
            const url = `${base.replace(/\/$/, '')}/districts`;
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                setDistricts(data);
                got = true;
                break;
              }
              // if empty array, still accept but continue trying others
              if (Array.isArray(data) && data.length === 0) {
                setDistricts([]);
                got = true;
                break;
              }
            } else {
              console.warn(`Failed to load districts from ${url}: ${res.status}`);
            }
          } catch (e) {
            console.warn(`Error contacting ${base}:`, e && e.message ? e.message : e);
          }
        }
        if (!got) {
          console.warn('Unable to load districts from any candidate URL');
        }
      } catch (e) {
        console.warn('Error loading districts', e);
      } finally {
        setLoadingDistricts(false);
      }
    };
    load();
  }, []);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (serverError) setServerError("");
    // clear server-side field error for this field when user edits it
    setErrors((prev) => {
      if (!prev || !prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = t('err_title');
    if (!formData.category) newErrors.category = t('err_category');
    if (!formData.district) newErrors.district = t('err_district');
    if (!formData.description.trim()) newErrors.description = t('err_desc');
    if (!formData.name.trim()) newErrors.name = t('err_name');
    if (!formData.email.trim()) {
      newErrors.email = t('err_email');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('err_email_invalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        // Try multiple base URLs to find a reachable backend (same candidates as district load)
        const candidates = [];
        if (process.env.REACT_APP_API_URL) candidates.push(process.env.REACT_APP_API_URL);
        candidates.push("http://localhost:5005/api");
        candidates.push("/api");

        setServerError("");
        setSubmitting(true);

        let succeeded = false;
        let lastError = null;

        for (const base of candidates) {
          const url = `${base.replace(/\/$/, '')}/complaints`;
          try {
            const response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: formData.title,
                category: formData.category,
                DistrictId: formData.district ? parseInt(formData.district, 10) : null,
                description: formData.description,
                name: formData.name,
                email: formData.email
              })
            });

            if (response.ok) {
              alert(t('complaint_success'));
              setFormData({ title: "", category: "", district: "", description: "", name: "", email: "" });
              setErrors({});
              onClose();
              succeeded = true;
              break;
            } else {
              // parse server-provided validation or error
              let errMsg = t('complaint_error');
              try {
                const errBody = await response.json();
                if (errBody) {
                  if (errBody.errors) setErrors((prev) => ({ ...prev, ...errBody.errors }));
                  if (errBody.message) errMsg = errBody.message;
                }
              } catch (e) {
                // ignore parse errors
              }
              setServerError(`${errMsg} (from ${url})`);
              succeeded = false;
              // don't continue to other candidates if server responded with an error
              break;
            }
          } catch (err) {
            // network error contacting this candidate — try next
            lastError = err;
            console.warn(`Failed to POST to ${url}:`, err && err.message ? err.message : err);
            continue;
          }
        }

        if (!succeeded && !serverError) {
          // no reachable candidate or none returned a response we could use
          const msg = lastError ? `${t('complaint_error')}: ${lastError.message || lastError}` : t('complaint_error');
          setServerError(msg + ' (tried multiple endpoints)');
        }
      } catch (error) {
        console.error("Ошибка:", error);
        setServerError(t('complaint_error'));
      } finally {
        setSubmitting(false);
      }
    }
  };



  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{t('complaint_modal_title')}</h2>
        <p className="subtitle">{t('complaint_modal_subtitle')}</p>

        {serverError && <div className="server-error">{serverError}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>

          <label>{t('complaint_title_label')}</label>
          <input
            type="text"
            name="title"
            placeholder={t('complaint_title_placeholder')}
            value={formData.title}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.title && <span className="error">{errors.title}</span>}


          <label>{t('complaint_category_label')}</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="">{t('complaint_category_placeholder')}</option>
            <option value="Транспортные выбросы">{t('cat_transport')}</option>
            <option value="Промышленные загрязнения">{t('cat_industrial')}</option>
            <option value="Пыль и строительные загрязнения">{t('cat_dust')}</option>
            <option value="Свалки и отходы">{t('cat_waste')}</option>
            <option value="Выбросы от отопления и частных домов">{t('cat_heating')}</option>
          </select>
          {errors.category && <span className="error">{errors.category}</span>}


          <label>{t('complaint_district_label')}</label>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="">{t('complaint_district_placeholder')}</option>
            {loadingDistricts && <option value="">Загрузка...</option>}
            {!loadingDistricts && districts && districts.length === 0 && (
              <>
                <option value="">Нет районов</option>
              </>
            )}
            {!loadingDistricts && districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.district && <span className="error">{errors.district}</span>}


          <label>{t('complaint_desc_label')}</label>
          <textarea
            name="description"
            placeholder={t('complaint_desc_placeholder')}
            value={formData.description}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.description && <span className="error">{errors.description}</span>}


          <p className="form-subtitle">{t('complaint_user_info')}</p>

          <div className="input-row">
            <div>
              <label>{t('complaint_name_label')}</label>
              <input
                type="text"
                name="name"
                placeholder={t('complaint_name_placeholder')}
                value={formData.name}
                onChange={handleChange}
                disabled={submitting}
              />
              
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div>
              <label>{t('complaint_email_label')}</label>
              <input
                type="email"
                name="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
          </div>



          <button type="submit" className="submit-btn" disabled={loadingDistricts || submitting}>
            {submitting ? (
              <>
                <span className="spinner" aria-hidden></span>
                {t('complaint_submit_btn')}
              </>
            ) : (
              t('complaint_submit_btn')
            )}
          </button>
        </form>
      </div >
    </div >
  );
};

export default ModalComplaint;

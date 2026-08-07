// src/features/referrals/hooks/useBonusSchemes.js
import { useState, useCallback } from 'react';
import {
  addBonusScheme,
  updateBonusScheme,
  deactivateBonusScheme,
  activateBonusScheme,
  getBonusSchemes,
} from '../../../api/adminApi';

export function useBonusSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});

  // 🔁 Map backend scheme → frontend (as before)
  const mapSchemeFromBackend = (backendScheme) => ({
    scheme_id: backendScheme.Scheme_Id,
    scheme_name: backendScheme.Scheme_Name,
    scheme_code: backendScheme.Scheme_Code,
    description: backendScheme.Description,
    schema_type: backendScheme.Scheme_Type,
    bonus_type: backendScheme.Bonus_Type === 'FIXED' ? 'Fixed' : 'Percentage',
    bonus_amount: backendScheme.Bonus_Type === 'FIXED' ? backendScheme.Bonus_Value : null,
    bonus_percentage: backendScheme.Bonus_Type === 'PERCENTAGE' ? backendScheme.Bonus_Value : null,
    bonus_value: backendScheme.Bonus_Value,
    trigger_event: backendScheme.Trigger_Event,
    is_active: backendScheme.Scheme_Status === 'Active' && backendScheme.Is_Currently_Valid,
    valid_from: backendScheme.Valid_From?.split(' ')[0] || '',
    valid_to: backendScheme.Valid_To?.split(' ')[0] || '',
    max_redemptions_per_user: backendScheme.Max_Redemptions_Per_User === 'Unlimited' ? '' : backendScheme.Max_Redemptions_Per_User,
    max_total_redemptions: backendScheme.Max_Total_Redemptions_Allowed === 'Unlimited' ? '' : backendScheme.Max_Total_Redemptions_Allowed,
    total_redemptions_so_far: backendScheme.Total_Redemptions_So_Far || 0,
  });

  // 🔁 Map frontend form data → backend payload (✅ includes scheme_code)
  const mapFormToPayload = (formData) => {
    const payload = {
      scheme_name: formData.scheme_name,
      scheme_code: formData.scheme_code,      // ✅ NOW INCLUDED
      description: formData.description,
      scheme_type: formData.schema_type,
      bonus_type: formData.bonus_type,
      bonus_value:
        formData.bonus_type === 'Fixed'
          ? parseFloat(formData.bonus_amount) || 0
          : parseFloat(formData.bonus_percentage) || 0,
      trigger_event: formData.trigger_event,
      max_redemptions_per_user: formData.max_redemptions_per_user,
      max_total_redemptions: formData.max_total_redemptions,
      valid_from: formData.valid_from ? `${formData.valid_from} 00:00:00` : '',
      valid_to: formData.valid_to ? `${formData.valid_to} 23:59:59` : '',
    };

    // Optional: remove only truly empty fields (but keep scheme_code even if empty to avoid missing)
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '' && key !== 'scheme_code') delete payload[key];
    });
    return payload;
  };

  // 📥 Fetch schemes
  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBonusSchemes();
      const backendData = res.data?.Data || {};
      const rawSchemes = backendData.data || [];
      const mappedSchemes = rawSchemes.map(mapSchemeFromBackend);
      const mappedStats = {
        total: backendData.Total_Schemes || 0,
        active: backendData.Active_Schemes || 0,
        expired: backendData.Expired_Schemes || 0,
        totalRedemptions: backendData.Total_Redemptions || 0,
      };
      setSchemes(mappedSchemes);
      setStats(mappedStats);
    } catch (err) {
      console.error('Failed to fetch bonus schemes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ➕ Create
  const createScheme = useCallback(
    async (formData) => {
      const payload = mapFormToPayload(formData);
      const res = await addBonusScheme(payload);
      await fetchSchemes();
      return res.data;
    },
    [fetchSchemes]
  );

  // ✏️ Update
  const updateScheme = useCallback(
    async (schemeCode, formData) => {
      const payload = mapFormToPayload(formData);
      payload.scheme_code = schemeCode; // ensure update also has it
      const res = await updateBonusScheme(payload);
      await fetchSchemes();
      return res.data;
    },
    [fetchSchemes]
  );

  // 🗑️ Delete (deactivate)
  const deleteScheme = useCallback(
    async (schemeCode) => {
      const res = await deactivateBonusScheme(schemeCode);
      await fetchSchemes();
      return res.data;
    },
    [fetchSchemes]
  );

  // ✅ Activate
  const activateScheme = useCallback(
    async (schemeCode) => {
      const res = await activateBonusScheme(schemeCode);
      await fetchSchemes();
      return res.data;
    },
    [fetchSchemes]
  );

  const deactivateScheme = deleteScheme;

  return {
    schemes,
    loading,
    stats,
    fetchSchemes,
    createScheme,
    updateScheme,
    deleteScheme,
    activateScheme,
    deactivateScheme,
  };
}
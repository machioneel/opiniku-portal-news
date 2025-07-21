import { useState, useEffect } from 'react';
import { DatabaseService } from '../lib/supabase';

// Custom hook untuk artikel
export const useArticles = (filters?: {
  status?: string;
  category?: string;
  author?: string;
  limit?: number;
}) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getArticles(filters);
        setArticles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [filters?.status, filters?.category, filters?.author, filters?.limit]);

  return { articles, loading, error, refetch: () => fetchArticles() };
};

// Custom hook untuk kategori
export const useCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getCategories();
        setCategories(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

// Custom hook untuk dashboard metrics
export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getDashboardMetrics();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
};

// Custom hook untuk pending approvals
export const usePendingApprovals = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getPendingApprovals();
      setApprovals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const approveArticle = async (articleId: string, approverId: string, comments?: string) => {
    try {
      await DatabaseService.approveArticle(articleId, approverId, comments);
      await fetchApprovals(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  const rejectArticle = async (articleId: string, approverId: string, comments: string) => {
    try {
      await DatabaseService.rejectArticle(articleId, approverId, comments);
      await fetchApprovals(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { 
    approvals, 
    loading, 
    error, 
    approveArticle, 
    rejectArticle,
    refetch: fetchApprovals 
  };
};
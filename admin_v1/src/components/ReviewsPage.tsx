import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Loader, MessageCircle, Search, Sparkles, Star } from 'lucide-react';

type Review = {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
};

type AdminResponse = {
  id: string;
  review_id: string;
  response: string;
  admin_id: string;
  admin_name: string;
  created_at: string;
  response_type: 'manual' | 'ai';
};

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [responsesByReview, setResponsesByReview] = useState<Record<string, AdminResponse[]>>({});
  const [manualReplies, setManualReplies] = useState<Record<string, string>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const reviewResponse = await axios.get<Review[]>(`${API_URL}/review/all/`, {
          withCredentials: true,
        });

        if (!active) return;

        const reviewItems = reviewResponse.data || [];
        setReviews(reviewItems);

        const responseEntries = await Promise.all(
          reviewItems.map(async (review) => {
            try {
              const response = await axios.get<AdminResponse[]>(`${API_URL}/review/${review.id}/responses/admin/`, {
                withCredentials: true,
              });
              return [review.id, response.data || []] as const;
            } catch {
              return [review.id, []] as const;
            }
          })
        );

        if (!active) return;

        setResponsesByReview(Object.fromEntries(responseEntries));
      } catch (fetchError) {
        setError('Khong the tai danh sach danh gia.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return reviews;

    return reviews.filter((review) =>
      [
        review.user_name,
        review.customer_id,
        review.product_id,
        review.comment,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [reviews, searchTerm]);

  const refreshResponses = async (reviewId: string) => {
    const response = await axios.get<AdminResponse[]>(`${API_URL}/review/${reviewId}/responses/admin/`, {
      withCredentials: true,
    });

    setResponsesByReview((prev) => ({
      ...prev,
      [reviewId]: response.data || [],
    }));
  };

  const handleGenerateAi = async (review: Review) => {
    try {
      setError(null);
      setSubmittingReviewId(review.id);
      await axios.post(
        `${API_URL}/review/responses/generate-ai/`,
        {
          review_id: review.id,
          rating: review.rating,
          comment: review.comment,
          product_name: review.product_id,
        },
        {
          withCredentials: true,
        }
      );
      await refreshResponses(review.id);
    } catch {
      setError('Khong the tao phan hoi bang AI cho review nay.');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const handleManualSubmit = async (reviewId: string) => {
    const content = (manualReplies[reviewId] || '').trim();
    if (!content) return;

    try {
      setError(null);
      setSubmittingReviewId(reviewId);
      await axios.post(
        `${API_URL}/review/responses/add/`,
        {
          review_id: reviewId,
          response: content,
        },
        {
          withCredentials: true,
        }
      );
      setManualReplies((prev) => ({
        ...prev,
        [reviewId]: '',
      }));
      await refreshResponses(reviewId);
    } catch {
      setError('Khong the gui phan hoi thu cong.');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="mr-2 h-8 w-8 animate-spin text-blue-600" />
        Dang tai danh gia...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        <AlertCircle className="mr-2 h-8 w-8" />
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">Danh gia san pham</h1>
        <p className="mb-6 text-gray-600">Xem danh gia khach hang va phan hoi tu dong bang AI.</p>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tim theo khach hang, product id, noi dung..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {filteredReviews.length ? (
        <div className="space-y-6">
          {filteredReviews.map((review) => {
            const responses = responsesByReview[review.id] || [];

            return (
              <article key={review.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{review.user_name || 'Khach hang'}</p>
                    <p className="text-sm text-gray-500">
                      Review ID: {review.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Product ID: {review.product_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2 flex items-center justify-end gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`h-4 w-4 ${index < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="mb-5 rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-700">
                  {review.comment}
                </div>

                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerateAi(review)}
                      disabled={submittingReviewId === review.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Sparkles className="h-4 w-4" />
                      {submittingReviewId === review.id ? 'Dang tao...' : 'Tao bang AI'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={manualReplies[review.id] || ''}
                      onChange={(event) =>
                        setManualReplies((prev) => ({
                          ...prev,
                          [review.id]: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Nhap phan hoi thu cong neu admin muon tu tra loi..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleManualSubmit(review.id)}
                      disabled={submittingReviewId === review.id || !(manualReplies[review.id] || '').trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {submittingReviewId === review.id ? 'Dang gui...' : 'Gui phan hoi thu cong'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <MessageCircle className="h-4 w-4" />
                    Phan hoi
                  </div>

                  {responses.length ? (
                    responses.map((response) => (
                      <div
                        key={response.id}
                        className={`rounded-xl border p-4 ${
                          response.response_type === 'ai'
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          {response.response_type === 'ai' ? <Sparkles className="h-4 w-4 text-emerald-600" /> : <MessageCircle className="h-4 w-4" />}
                          {response.response_type === 'ai' ? 'AI Assistant' : response.admin_name}
                        </div>
                        <p className="text-sm leading-7 text-gray-700">{response.response}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                      Chua co phan hoi nao cho review nay.
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          Chua co review nao de hien thi.
        </div>
      )}
    </div>
  );
}

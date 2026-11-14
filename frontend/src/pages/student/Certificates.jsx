import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/services/api';
import { Award, Download, ExternalLink } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Certificates() {
  const { t } = useTranslation();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['student-certificates'],
    queryFn: () => studentApi.getCertificates(),
    select: (res) => res.data,
  });

  const handleDownload = async (certId) => {
    try {
      const res = await studentApi.downloadCertificate(certId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download certificate.');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">{t('certificates.title')}</h1>
        <p className="section-subtitle">{t('certificates.subtitle')}</p>
      </div>

      {!certificates?.length ? (
        <EmptyState
          icon={Award}
          title={t('certificates.empty')}
          description={t('certificates.emptyDesc')}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div key={cert.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-br from-primary-600 via-purple-600 to-indigo-700 flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
                }} />
                <Award className="w-14 h-14 text-white/80" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">{cert.course?.title}</h3>
                <p className="text-xs text-gray-400 mb-1">by {cert.course?.teacher?.name}</p>
                <p className="text-xs text-gray-400 mb-4">
                  {t('certificates.issued')}: {cert.issued_at ? format(new Date(cert.issued_at), 'MMMM d, yyyy') : '-'}
                </p>
                {cert.credential_id && (
                  <p className="text-xs text-gray-400 mb-3">ID: <span className="font-mono">{cert.credential_id}</span></p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(cert.id)}
                    className="btn btn-primary btn-sm flex-1 justify-center"
                  >
                    <Download className="w-3 h-3" /> {t('certificates.download')}
                  </button>
                  {cert.certificate_url && (
                    <a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

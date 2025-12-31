import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function NoPinsEmptyState({ onCreateClick }: { onCreateClick?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-20 h-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      }
      title="No pins yet"
      description="Start saving pins by clicking the 'Create Pin' button."
      action={
        onCreateClick
          ? {
              label: 'Create your first pin',
              onClick: onCreateClick,
            }
          : undefined
      }
    />
  );
}

export function NoBoardsEmptyState({ onCreateClick }: { onCreateClick?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-20 h-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
      title="No boards yet"
      description="Create boards to organize your pins by theme, project, or any way you like."
      action={
        onCreateClick
          ? {
              label: 'Create your first board',
              onClick: onCreateClick,
            }
          : undefined
      }
    />
  );
}

export function NoSearchResultsEmptyState({ searchQuery }: { searchQuery?: string }) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-20 h-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No results found"
      description={
        searchQuery
          ? `We couldn't find anything matching "${searchQuery}". Try different keywords.`
          : "Try searching with different keywords."
      }
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again later.",
  onRetry
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-20 h-20 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      }
      title={title}
      description={message}
      action={
        onRetry
          ? {
              label: 'Try again',
              onClick: onRetry,
            }
          : undefined
      }
    />
  );
}

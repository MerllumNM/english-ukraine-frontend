import React, { useEffect, useState } from 'react';

export default function UserMenu({ user, t, onProfile }) {
  const [hasAvatarError, setHasAvatarError] = useState(false);

  useEffect(() => {
    setHasAvatarError(false);
  }, [user.avatar]);

  return (
    <button
      className="user-menu-trigger"
      type="button"
      aria-label={`${user.name}, ${t.profileTitle}`}
      title={t.profileTitle}
      onClick={onProfile}
    >
      {user.avatar && !hasAvatarError ? (
        <img
          className="user-menu-avatar"
          src={user.avatar}
          alt=""
          onError={() => setHasAvatarError(true)}
        />
      ) : (
        <span className="user-menu-avatar user-menu-initial" aria-hidden="true">
          {user.name.trim()[0]?.toUpperCase()}
        </span>
      )}
      <span className="user-menu-name">{user.name}</span>
      <span className="user-menu-chevron" aria-hidden="true">⌄</span>
    </button>
  );
}

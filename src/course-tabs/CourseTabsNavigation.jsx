import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import messages from './messages';
import leaderboardMessages from '../leaderboard/messages';
import Tabs from '../generic/tabs/Tabs';
import { CoursewareSearch, CoursewareSearchToggle } from '../course-home/courseware-search';
import { useCoursewareSearchState } from '../course-home/courseware-search/hooks';

const CourseTabsNavigation = ({
  activeTabSlug, className, tabs, intl,
}) => {
  const { show } = useCoursewareSearchState();

  // Add leaderboard tab if not already present
  const enhancedTabs = useMemo(() => {
    const hasLeaderboard = tabs.some((tab) => tab.slug === 'leaderboard');
    if (hasLeaderboard) {
      return tabs;
    }

    // Extract courseId and base path from the first tab's URL
    const firstTab = tabs[0];
    if (!firstTab) {
      return tabs;
    }

    // Match pattern like /learning/course/course-v1:... or /course/course-v1:...
    const urlMatch = firstTab.url.match(/(.*\/course\/)([^/]+)/);
    if (!urlMatch) {
      return tabs;
    }

    const basePath = urlMatch[1]; // e.g., "/learning/course/" or "/course/"
    const courseId = urlMatch[2];
    const leaderboardTab = {
      title: `🏆 ${intl.formatMessage(leaderboardMessages.leaderboardTitle)}`,
      slug: 'leaderboard',
      url: `${basePath}${courseId}/leaderboard`,
    };

    // Insert leaderboard after progress tab or at the end
    const progressIndex = tabs.findIndex((tab) => tab.slug === 'progress');
    if (progressIndex !== -1) {
      return [
        ...tabs.slice(0, progressIndex + 1),
        leaderboardTab,
        ...tabs.slice(progressIndex + 1),
      ];
    }

    return [...tabs, leaderboardTab];
  }, [tabs, intl]);

  return (
    <div id="courseTabsNavigation" className={classNames('course-tabs-navigation', className)}>
      <div className="container-xl">
        <Tabs
          className="nav-underline-tabs"
          aria-label={intl.formatMessage(messages.courseMaterial)}
        >
          {enhancedTabs.map(({ url, title, slug }) => (
            <a
              key={slug}
              className={classNames('nav-item flex-shrink-0 nav-link', { active: slug === activeTabSlug })}
              href={url}
            >
              {title}
            </a>
          ))}
        </Tabs>
      </div>
      <div className="course-tabs-navigation__search-toggle">
        <CoursewareSearchToggle />
      </div>
      {show && <CoursewareSearch />}
    </div>
  );
};

CourseTabsNavigation.propTypes = {
  activeTabSlug: PropTypes.string,
  className: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
  intl: intlShape.isRequired,
};

CourseTabsNavigation.defaultProps = {
  activeTabSlug: undefined,
  className: null,
};

export default injectIntl(CourseTabsNavigation);

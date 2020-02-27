import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import _ from 'lodash'
import moment from 'moment'
import styles from './styles.module.scss'
import BackArrow from '../../assets/images/left-arrow.svg'
import GearIcon from '../../assets/images/icon-settings-gear.svg'
import TickIcon from '../../assets/images/icon-checkmark.svg'
import NotificationIcon from '../../assets/images/icon-bell.svg'
const eventTypes = {
  PROJECT: {
    ACTIVE: 'connect.notification.project.active',
    COMPLETED: 'connect.notification.project.completed'
  }
}
const Item = ({ item, onDismiss, markNotificationAsRead }) =>
  <div className={styles['noti-item']}>
    <div className={styles.left}>
      <p className={styles['txt']}>{item.contents}</p>
      <span className={styles['time-txt']}>{moment(item.date).fromNow()}</span>
    </div>
    <div className={styles.right}>
      {
        !item.isRead &&
        (<div className={cn([styles.point, item.isSeen && styles['point-grey'], !item.isSeen && styles['point-red']])}
          onClick={() => { markNotificationAsRead(item) }} />)}
    </div>
  </div>

Item.propTypes = {
  item: PropTypes.object,
  onDismiss: PropTypes.func,
  markNotificationAsRead: PropTypes.func.isRequired
}

export default class NotificationList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      completedSection: [],
      nonCompletedSection: []
    }
  }

  componentDidMount () {
    const { notifications } = this.props
    this.setState({
      completedSection: _.uniq(
        (notifications || [

        ])).filter(t => t.isComplete)
    })
    this.setState({
      nonCompletedSection: _.uniq(
        (notifications || [

        ])).filter(t => !t.isComplete)
    })
  }

  challenges (list) {
    list = list || []
    const challengeTitles = _.uniq(
      list.map(noti => noti.sourceName).filter(x => x)
    )
    var group = challengeTitles.map(title =>
      ({
        challengeTitle: title, items: list.filter(t => t.sourceName === title)
      }))

    return group
  }

  render () {
    const { onClose, onSettings, onDismiss, notifications, markNotificationAsRead,
      markAllNotificationAsRead, dismissChallengeNotifications } = this.props
    let completedSection = _.filter((notifications || []), t => t.eventType === eventTypes.PROJECT.COMPLETED)
    let nonCompletedSection = _.filter((notifications || []), t => t.eventType !== eventTypes.PROJECT.COMPLETED)
    return (
      <>
        <div className={styles['noti-header']}>
          <div className={styles['lefts']}>
            <div
              className={styles['notification-icon']}
            >
              <NotificationIcon />
            </div>
            <div
              className={styles['notification-left-btn-mobile']}
              role='button'
              onClick={onClose}
            >
              <BackArrow />
            </div>
            <span className={styles['noti-title']}>Notifications</span>
          </div>
          <span className={styles['noti-title-mobileonly']}>Notifications</span>

          <div className={styles.rights}>
            <span
              role='button'
              className={styles['white-link']}
              onClick={() => markAllNotificationAsRead()}
            >
              Mark All as Read
            </span>
            &nbsp;<span className={styles.point} />&nbsp;
            <span
              role='button'
              className={styles['white-link']}
              onClick={onSettings}
            >
              Settings
            </span>
          </div>
          <div className={styles['rights-mobile']}>
            <div
              className={styles['btn-tick']}
              role='button'
              onClick={markAllNotificationAsRead}
            >
              <TickIcon />
            </div>
            <div
              role='button'
              className={styles['btn-setting']}
            >
              <GearIcon />
            </div>
          </div>
        </div>
        <div className={styles['noti-body']}>
          <Fragment key='nonComplete'>
            {
              this.challenges(nonCompletedSection).map((challenge, challengeIdx) =>
                (
                  <Fragment key={`nonComplete-${challengeIdx}`}>
                    <div key={`noti-${challengeIdx}`} className={styles['challenge-title']}>
                      <span>{challenge.challengeTitle}</span>
                    </div>
                    {challenge.items.map((item, itemIdx) =>
                      (<Item
                        item={item}
                        markNotificationAsRead={markNotificationAsRead}
                        key={`noti-${challengeIdx}-${itemIdx}`}
                        onDismiss={() => onDismiss([item])}
                      />))}
                  </Fragment>
                ))
            }
          </Fragment>
          <div className={styles['completed-header']}>Completed Challenges</div>
          <Fragment key='completed'>
            {
              this.challenges(completedSection).map((challenge, challengeIdx) =>
                (
                  <div key={`noti-completed-${challengeIdx}`} className={cn([styles['challenge-title'], styles['completed-challenge']])}>
                    <span>{challenge.challengeTitle}</span>
                    <div className={styles['dismiss-challenge']} onClick={c => {
                      const challegeId = challenge && challenge.items && challenge.items.length && challenge.items[0].sourceId
                      if (challegeId) {
                        dismissChallengeNotifications(challegeId)
                      }
                    }}>&times;</div>
                  </div>
                ))
            }
          </Fragment>
        </div>
        <div className={styles['view-all-notifications']}>
          <a href='/notifications'>View all Notifications</a>
        </div>
      </>
    )
  }
}

NotificationList.defaultProps = {
  notifications: [],
  onDismiss: () => null,
  markAllNotificationAsRead: () => null,
  markNotificationAsRead: () => null
}

NotificationList.propTypes = {
  /**
   * Array of Notifications, each with properties:
   *
   *   - id {number} message identifier
   *   - sourceId {number} identifies the associated challenge
   *   - sourceName {string} challenge title
   *   - eventType {string} indicates if challenge is active(connect.notification.project.active)
   *       or completed(connect.notification.project.completed)
   *   - date {date} when notification was raised
   *   - isRead {boolean} indicates if is read
   *   - isSeen {boolean} indicates if is seen
   *   - contents {string} message
   *
  */
  notifications: PropTypes.array,

  /**
   * Called with array of items to be dismissed.
   *
   * @param items {array} Items to be dismissed
   */
  onDismiss: PropTypes.func,

  /** Called on Settings button click */
  onSettings: PropTypes.func,

  onClose: PropTypes.func,

  markNotificationAsRead: PropTypes.func.isRequired,
  markAllNotificationAsRead: PropTypes.func.isRequired,
  dismissChallengeNotifications: PropTypes.func.isRequired
}

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  generatePath,
  Link,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';

import { type Student } from '@oyster/types';
import { Modal, ProfilePicture } from '@oyster/ui';

import { Route } from '../shared/constants';
import { countEventAttendees, listEventAttendees } from '../shared/core.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const eventId = params.id as string;

  const [attendees, attendeesCount] = await Promise.all([
    listEventAttendees({
      select: [
        'students.firstName',
        'students.id',
        'students.lastName',
        'students.preferredName',
        'students.profilePicture',
      ],
      where: { eventId },
    }),
    countEventAttendees({
      where: { eventId },
    }),
  ]);

  return json({
    attendees,
    attendeesCount,
  });
}

export default function EventAttendeesPage() {
  const { attendees, attendeesCount } = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  function onClose() {
    navigate(Route['/events/past']);
  }

  return (
    <Modal onClose={onClose}>
      <Modal.Header>
        <Modal.Title>Attendees List ({attendeesCount})</Modal.Title>
        <Modal.CloseButton />
      </Modal.Header>

      <ul className="flex flex-col">
        {attendees.map((attendee) => {
          return (
            <li key={attendee.id}>
              <AttendeeItem
                firstName={attendee.firstName || ''}
                lastName={attendee.lastName || ''}
                id={attendee.id || ''}
                profilePicture={attendee.profilePicture}
              />
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

type AttendeeItemProps = Pick<
  Student,
  'firstName' | 'id' | 'lastName' | 'profilePicture'
>;

function AttendeeItem({
  firstName,
  id,
  lastName,
  profilePicture,
}: AttendeeItemProps) {
  return (
    <Link
      className="line-clamp-1 grid grid-cols-[3rem_1fr] items-center gap-2 rounded-2xl p-2 hover:bg-gray-100"
      to={generatePath(Route['/directory/:id'], { id })}
    >
      <ProfilePicture
        initials={firstName[0] + lastName[0]}
        src={profilePicture || undefined}
      />
      <span>
        {firstName} {lastName}
      </span>
    </Link>
  );
}

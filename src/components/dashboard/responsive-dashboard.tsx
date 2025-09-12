        {
          title: 'New Assignment',
          description: 'Science project assigned',
          time: '3 hours ago',
          icon: <ClipboardListIcon className="h-4 w-4" />
        }
      ];
    default:
      return baseActivity;
  }
}

// Helper function for conditional classes
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}



#import <Cocoa/Cocoa.h>

@interface DummyNibOwner : NSObject

// View bindings go here
@property IBOutlet NSButton *renameButton;
@property IBOutlet NSButton *applyButton;
@property IBOutlet NSTextField *findField;
@property IBOutlet NSTextField *replaceField;
@property IBOutlet NSButton *ignoreCaseCheckbox;
@property IBOutlet NSButton *regexCheckbox;
@property IBOutlet NSButton *showOnlyMatchingStylesCheckbox;
@property IBOutlet NSButton *autoscrollCheckbox;
@property IBOutlet NSScrollView *scrollView;
@property IBOutlet NSTextField *beforeLabel;
@property IBOutlet NSTextField *afterLabel;
@property IBOutlet NSTextField *countLabel;
// End of view bindings

// View actions go here
- (IBAction)handleRename:(id)sender;
- (IBAction)handleApply:(id)sender;
- (IBAction)handleCancel:(id)sender;
- (IBAction)toggleShowOnlyMatchingStyles:(id)sender;
- (IBAction)toggleAutoscroll:(id)sender;
- (IBAction)toggleFindOption:(id)sender;
// End of actions

@end

@implementation DummyNibOwner
@end

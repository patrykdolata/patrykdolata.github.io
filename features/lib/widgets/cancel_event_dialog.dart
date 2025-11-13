import 'package:flutter/material.dart';
import 'package:your_app/models/event.dart';

class CancelEventDialog extends StatefulWidget {
  final Function(String?) onConfirm;

  const CancelEventDialog({Key? key, required this.onConfirm}) : super(key: key);

  @override
  State<CancelEventDialog> createState() => _CancelEventDialogState();
}

class _CancelEventDialogState extends State<CancelEventDialog> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Cancel Event'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _reasonController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Cancellation Reason (optional)',
                hintText: 'Why is the event being cancelled?',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value != null && value.length > 200) {
                  return 'Reason must be less than 200 characters';
                }
                return null;
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Keep Event'),
        ),
        TextButton(
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              final reason = _reasonController.text.trim();
              widget.onConfirm(reason.isEmpty ? null : reason);
              Navigator.pop(context);
            }
          },
          child: const Text(
            'Cancel Event',
            style: TextStyle(color: Colors.red),
          ),
        ),
      ],
    );
  }
}